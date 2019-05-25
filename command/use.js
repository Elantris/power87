const emoji = require('node-emoji')

const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const items = require('../util/items')

const sendResponseMessage = require('../util/sendResponseMessage')

const usableKinds = {
  fishing: true,
  buff: true,
  petfood: true
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let target = {
    search: '',
    itemId: '',
    itemKind: '',
    amount: 1,
    firstIndex: 0
  }

  // check target exists
  if (args[1]) {
    target.search = emoji.unemojify(args[1]).toLowerCase()
    for (let itemId in items) {
      if (target.search === items[itemId].name || target.search === items[itemId].icon || target.search === items[itemId].displayName) {
        target.itemId = itemId
        target.itemKind = items[itemId].kind
        if (args[2]) {
          target.amount = parseInt(args[2])
        }
        break
      }
    }

    if (!target.itemId) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (!usableKinds[target.itemKind]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_USABLE' })
      return
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let itemsCount = {}
  userInventory.items.filter(item => usableKinds[items[item.id].kind]).forEach(item => {
    if (!itemsCount[item.id]) {
      itemsCount[item.id] = 0
    }
    itemsCount[item.id]++
  })

  let description = ''

  // no arguments
  if (args.length === 1) {
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以使用的道具：\n`

    for (let itemId in itemsCount) {
      description += `\n${items[itemId].icon}**${items[itemId].displayName}**x${itemsCount[itemId]}，\`87!use ${items[itemId].name}\``
    }

    sendResponseMessage({ message, description })
    return
  }

  // user target
  if (!itemsCount[target.itemId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
    return
  }

  // fishing system
  let fishingRaw = await database.ref(`/fishing/${guildId}/${userId}`).once('value')
  if (fishingRaw.exists()) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  if (target.amount > itemsCount[target.itemId]) {
    target.amount = itemsCount[target.itemId]
  }

  if (target.itemKind === 'buff') {
    let buffId = items[target.itemId].buffId
    // extend duration of buff
    if (!userInventory.buffs[buffId] || userInventory.buffs[buffId] < message.createdTimestamp) {
      userInventory.buffs[buffId] = message.createdTimestamp
    }
    userInventory.buffs[buffId] = userInventory.buffs[buffId] + items[target.itemId].duration * target.amount

    description = `:arrow_double_up: ${message.member.displayName} 使用了 ${items[target.itemId].icon}**${items[target.itemId].displayName}**x${target.amount}`
  } else if (target.itemKind === 'petfood' || target.itemKind === 'fishing') {
    // hero system
    let heroRaw = await database.ref(`/hero/${guildId}/${userId}`).once('value')
    if (!heroRaw.exists()) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_HERO' })
      return
    }

    let userHero = heroSystem.parse(heroRaw.val(), message.createdTimestamp)
    if (userHero.status === 'dead') {
      database.ref(`/hero/${guildId}/${userId}`).remove()
      sendResponseMessage({ message, errorCode: 'ERROR_HERO_DEAD' })
      return
    }

    if (userHero.feed === userHero.maxFeed) {
      sendResponseMessage({ message, description: `:scroll: :${userHero.species}: **${userHero.name}** 現在很飽` })
      return
    }

    if (userHero.feed < 0) {
      userHero.feed = 0
    }
    let hunger = userHero.maxFeed - userHero.feed
    let maxAmount = Math.ceil(hunger / items[target.itemId].feed)
    if (target.amount > maxAmount) {
      target.amount = maxAmount
    }

    // feed hero
    let feedGain = items[target.itemId].feed * target.amount
    userHero.feed += feedGain
    if (userHero.feed > userHero.maxFeed) {
      feedGain = hunger
      userHero.feed = userHero.maxFeed
    }
    userHero.exp += Math.floor(Math.random() * (feedGain - target.amount) + target.amount)

    for (let i = 0; i < feedGain; i++) {
      if (Math.random() < 0.01) {
        userInventory.items.push({
          id: '28',
          amount: 1
        })
      }
    }

    database.ref(`/hero/${guildId}/${userId}`).set(heroSystem.make(userHero, message.createdTimestamp))

    description = `:scroll: ${message.member.displayName} 召喚的英雄 :${userHero.species}:** ${userHero.name}** 吃了 ${items[target.itemId].icon}**${items[target.itemId].displayName}**x${target.amount}，恢復 ${feedGain} 點飽食度`
  }

  // update database
  inventorySystem.removeItems(userInventory, target.itemId, target.amount)
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  sendResponseMessage({ message, description })
}
