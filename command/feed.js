const emoji = require('node-emoji')

const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const items = require('../util/items')

const sendResponseMessage = require('../util/sendResponseMessage')

const usableKinds = {
  fishing: true,
  petfood: true
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  // check target exists
  let target = {}
  if (args[1]) {
    let search = args[1].toLowerCase()

    for (let itemId in items) {
      if (search === items[itemId].name || search === emoji.emojify(items[itemId].icon) || emoji.unemojify(search) === items[itemId].icon || search === items[itemId].displayName) {
        target = {
          itemId,
          kind: items[itemId].kind,
          amount: parseInt(args[2] || 1)
        }
        break
      }
    }

    if (!target.itemId) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (!usableKinds[target.kind]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_USABLE' })
      return
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  // let itemsCount = {}
  // userInventory.items.filter(item => usableKinds[items[item.id].kind]).forEach(item => {
  //   if (!itemsCount[item.id]) {
  //     itemsCount[item.id] = 0
  //   }
  //   itemsCount[item.id]++
  // })

  let description = ''

  if (args.length === 1) { // list all usable items
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以餵食英雄的物品：\n`

    for (let itemId in userInventory.items) {
      if (usableKinds[items[itemId].kind]) {
        description += `\n${items[itemId].icon}**${items[itemId].displayName}**x${userInventory.items[itemId]}，**+${items[itemId].feed}**，\`87!feed ${items[itemId].name}\``
      }
    }

    sendResponseMessage({ message, description })
    return
  }

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  if (!userInventory.items[target.itemId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
    return
  }

  if (target.amount > userInventory.items[target.itemId]) {
    target.amount = userInventory.items[target.itemId]
  }

  // hero system
  let userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_HERO' })
    return
  }

  if (userHero.status === 'dead') {
    database.ref(`/hero/${guildId}/${userId}`).remove()
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_DEAD' })
    return
  }

  if (userHero.feed === userHero.maxFeed) {
    sendResponseMessage({ message, description: `:scroll: :${userHero.species}: **${userHero.name}** 現在很飽` })
    return
  }

  // feed hero
  if (userHero.feed < 0) {
    userHero.feed = 0
  }
  let hunger = userHero.maxFeed - userHero.feed
  let maxUseAmount = Math.ceil(hunger / items[target.itemId].feed)
  if (target.amount > maxUseAmount) {
    target.amount = maxUseAmount
  }

  let feedGain = items[target.itemId].feed * target.amount
  userHero.feed += feedGain
  if (userHero.feed > userHero.maxFeed) {
    feedGain = hunger
    userHero.feed = userHero.maxFeed
  }

  userHero.exp += Math.floor(Math.random() * (feedGain - target.amount) + target.amount)

  userInventory.items[target.id] -= target.amount

  let stampAmount = 0
  for (let i = 0; i < feedGain; i++) {
    if (Math.random() < 0.01) {
      stampAmount++
    }
  }

  if (!userInventory.items[28]) {
    userInventory.items[28] = 0
  }
  userInventory.items[28] += stampAmount

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  // response
  description = `:scroll: ${message.member.displayName} 召喚的英雄 :${userHero.species}:** ${userHero.name}** 吃了 ${items[target.itemId].icon}**${items[target.itemId].displayName}**x${target.amount}，恢復 ${feedGain} 點飽食度`
  sendResponseMessage({ message, description })
}
