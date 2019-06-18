const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
const sendResponseMessage = require('../util/sendResponseMessage')

const availableKinds = {
  buff: true,
  box: true,
  hero: true
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let description = ''
  let target = {}

  // check args format
  if (args[1]) {
    let results = findTargets(args[1].toLowerCase())

    if (results.length === 0) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (results.length > 1) {
      description = `:arrow_double_up: 指定其中一種道具/物品：\n`
      results.filter(result => availableKinds[items[result.id].kind]).forEach(result => {
        let item = items[result.id]
        description += `\n${item.icon}**${item.displayName}**，\`${item.kind}/${item.name}\`，\`87!use ${item.name}\``
      })
      sendResponseMessage({ message, description })
      return
    }

    target = results[0]
    target.kind = items[target.id].kind
    target.amount = 1

    if (!availableKinds[target.kind]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_USABLE' })
      return
    }

    if (args[2] && target.kind !== 'hero') {
      if (!Number.isSafeInteger(parseInt(args[2]))) {
        sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
        return
      }
      target.amount = parseInt(args[2])
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  if (args.length === 1) { // no arguments
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以使用的道具：\n`

    for (let id in userInventory.items) {
      if (availableKinds[items[id].kind]) {
        description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}，\`87!use ${items[id].name}\``
      }
    }

    sendResponseMessage({ message, description })
    return
  }

  if (!userInventory.items[target.id]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
    return
  }

  if (target.amount > userInventory.items[target.id]) {
    target.amount = userInventory.items[target.id]
  }

  if (target.kind === 'buff') { // extend duration of buff
    let durationGain = items[target.id].duration * target.amount
    description = `:arrow_double_up: ${message.member.displayName} 獲得了 ${durationGain / 60000} 分鐘 ${items[target.id].icon}**${items[target.id].displayName}** 的效果`

    let buffId = items[target.id].buffId

    if (!userInventory.buffs[buffId]) {
      userInventory.buffs[buffId] = message.createdTimestamp
    }

    userInventory.buffs[buffId] = userInventory.buffs[buffId] + durationGain
  } else if (target.kind === 'box') { // open box and get items
    description = `:arrow_double_up: ${message.member.displayName} 打開了 ${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}，獲得物品：\n\n`

    items[target.id].content.split(',').forEach(v => {
      let itemData = v.split('.')
      if (!userInventory.items[itemData[0]]) {
        userInventory.items[itemData[0]] = 0
      }
      let amount = parseInt(itemData[1] || 1) * target.amount
      userInventory.items[itemData[0]] += amount
      description += `${items[itemData[0]].icon}**${items[itemData[0]].displayName}**x${amount} `
    })
  } else if (target.kind === 'hero') { // hero kind
    if (!args[2]) {
      sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
      return
    }

    let userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)

    target.amount = 1
    description = `:scroll: ${message.member.displayName} 消耗了 ${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}\n\n`

    let errorCode

    if (items[target.id].name === 'summon-scroll') {
      errorCode = heroSystem.summon(userHero, args[2])
      description += `從異世界召喚出 :${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}！`
    } else if (items[target.id].name === 'change-name') {
      errorCode = heroSystem.changeName(userHero, args[2])
      description += `將召喚的英雄更名為 :${userHero.species}: **${userHero.name}**`
    } else if (items[target.id].name === 'change-looks') {
      errorCode = heroSystem.changeLooks(userHero, args[2])
      description += `變更了英雄的外型 :${userHero.species}: **${userHero.name}**`
    } else if (items[target.id].name === 'reset-ability') {
      errorCode = heroSystem.resetAbility(userHero)
      description += `重置了 :${userHero.species}: **${userHero.name}** 的各項體質`
    }

    if (errorCode) {
      if (errorCode === 'ERROR_HERO_DEAD') {
        database.ref(`/hero/${guildId}/${userId}`).remove()
      }
      sendResponseMessage({ message, errorCode })
      return
    }

    heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)
  }

  // update database
  userInventory.items[target.id] -= target.amount
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  sendResponseMessage({ message, description })
}
