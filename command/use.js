const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const items = require('../util/items')
const equipments = require('../util/equipments')
const findTargets = require('../util/findTargets')

const availableKinds = {
  buff: true,
  box: true,
  hero: true,
  equipment: true
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let description
  let target = {}

  // target
  if (args[1]) {
    let results = findTargets(args[1].toLowerCase()).filter(result => result.type === 'item' && items[result.id].kind in availableKinds)

    if (results.length === 0) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }

    if (results.length > 1) {
      description = `:arrow_double_up: 指定其中一種道具/物品：\n`
      results.forEach(result => {
        let item = items[result.id]
        description += `\n${item.icon}**${item.displayName}**，\`87!use ${item.name}\``
      })
      return { description }
    }

    target = results[0]
    target.kind = items[target.id].kind
    target.amount = 1

    if (!availableKinds[target.kind]) {
      return { errorCode: 'ERROR_NOT_USABLE' }
    }

    if (args[2] && target.kind !== 'hero') {
      if (!Number.isSafeInteger(parseInt(args[2]))) {
        return { errorCode: 'ERROR_FORMAT' }
      }
      target.amount = parseInt(args[2])
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status === 'fishing') {
    return { errorCode: 'ERROR_IS_FISHING' }
  }

  // no arguments
  if (args.length === 1) {
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以使用的道具：\n`

    for (let id in userInventory.items) {
      if (availableKinds[items[id].kind]) {
        description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}，\`87!use ${items[id].name} ${userInventory.items[id]}\``
      }
    }

    return { description }
  }

  if (!userInventory.items[target.id]) {
    return { errorCode: 'ERROR_NO_ITEM' }
  }

  if (target.amount > userInventory.items[target.id]) {
    target.amount = userInventory.items[target.id]
  }

  if (target.kind === 'buff') { // extend duration of buff
    let durationGain = items[target.id].duration * target.amount
    description = `:arrow_double_up: ${message.member.displayName} 獲得 ${durationGain / 60000} 分鐘 ${items[target.id].icon}**${items[target.id].displayName}** 的效果`

    let buffId = items[target.id].buffId

    if (!userInventory.buffs[buffId]) {
      userInventory.buffs[buffId] = message.createdTimestamp
    }

    userInventory.buffs[buffId] = userInventory.buffs[buffId] + durationGain
  } else if (target.kind === 'box') { // open box and get items
    description = `:arrow_double_up: ${message.member.displayName} 打開 ${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}，獲得物品：\n\n`

    items[target.id].contains.split(',').forEach(v => {
      let itemData = v.split('.')
      if (!userInventory.items[itemData[0]]) {
        userInventory.items[itemData[0]] = 0
      }
      let amount = parseInt(itemData[1] || 1) * target.amount
      userInventory.items[itemData[0]] += amount
      description += `${items[itemData[0]].icon}**${items[itemData[0]].displayName}**x${amount} `
    })
  } else if (target.kind === 'hero') { // hero kind
    let userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)

    target.amount = 1
    description = `:scroll: ${message.member.displayName} 消耗 ${items[target.id].icon}**${items[target.id].displayName}**x1\n\n`

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
      return { errorCode }
    }

    heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)
  } else if (target.kind === 'equipment') {
    if (userInventory.equipments.length >= 8) {
      return { errorCode: 'ERROR_ITEM_EXCEED' }
    }

    target.amount = 1
    description = `:scroll: ${message.member.displayName} 消耗 ${items[target.id].icon}**${items[target.id].displayName}**x1\n\n`

    let errorCode
    if (items[target.id].name === 'base-weapon') {
      errorCode = inventorySystem.exchangeEquipment(userInventory, 'weapon', 'base')
    } else if (items[target.id].name === 'base-armor') {
      errorCode = inventorySystem.exchangeEquipment(userInventory, 'armor', 'base')
    } else {
      errorCode = 'ERROR_NOT_FOUND'
    }

    if (errorCode) {
      return { errorCode }
    }

    let newEquipment = userInventory.equipments.slice(-1)[0]
    description += `獲得了 ${items[target.id].icon}**${equipments[newEquipment.id].displayName}**+0`

    userInventory.equipments.sort((a, b) => a.id - b.id)
  }

  // update database
  userInventory.items[target.id] -= target.amount
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  return { description }
}
