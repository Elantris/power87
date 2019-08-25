const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const items = require('../util/items')
const findTargets = require('../util/findTargets')

module.exports = async ({ args, database, message, guildId, userId }) => {
  let description
  let target = {}

  if (args[1]) {
    const results = findTargets(args[1].toLowerCase()).filter(result => result.type === 'item' && 'feed' in items[result.id])

    if (results.length === 0) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }

    if (results.length > 1) {
      description = ':arrow_double_up: 指定其中一種道具/物品：\n'
      results.forEach(result => {
        description += `\n${items[result.id].icon}**${items[result.id].displayName}**，**+${items[result.id].feed}**，\`87!feed ${items[result.id].name}\``
      })
      return { description }
    }

    target = results[0]
    target.kind = items[target.id].kind
    target.amount = 1
  }

  if (args[2]) {
    if (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1) {
      return { errorCode: 'ERROR_FORMAT' }
    }

    target.amount = parseInt(args[2])
  }

  // inventory system
  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status !== 'stay') {
    return { errorCode: 'ERROR_IS_BUSY' }
  }

  if (args.length === 1) {
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以餵食英雄的物品：\n`

    for (const id in userInventory.items) {
      if ('feed' in items[id]) {
        description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}，**+${items[id].feed}**，\`87!feed ${items[id].name} ${userInventory.items[id]}\``
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

  // hero system
  const userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero.name) {
    return { errorCode: 'ERROR_NO_HERO' }
  }

  if (userHero.feed === userHero.maxFeed) {
    return { description: `:scroll: :${userHero.species}: **${userHero.name}** 現在很飽` }
  }

  // feed hero
  if (userHero.feed < 0) {
    userHero.feed = 0
  }
  const hunger = userHero.maxFeed - userHero.feed
  const maxUseAmount = Math.ceil(hunger / items[target.id].feed)
  if (target.amount > maxUseAmount) {
    target.amount = maxUseAmount
  }

  let feedGain = items[target.id].feed * target.amount
  userHero.feed += feedGain
  if (userHero.feed > userHero.maxFeed) {
    feedGain = hunger
    userHero.feed = userHero.maxFeed
  }

  let expGain = 0
  for (let i = 0; i < target.amount; i++) {
    expGain += Math.floor(Math.random() * items[target.id].feed) + 1
  }
  if (expGain > feedGain) {
    expGain = feedGain
  }
  userHero.exp += expGain

  let stampAmount = 0
  for (let i = 0; i < feedGain; i++) {
    if (Math.random() < 0.05) {
      stampAmount++
    }
  }

  if (!userInventory.items[28]) {
    userInventory.items[28] = 0
  }
  userInventory.items[28] += stampAmount
  userInventory.items[target.id] -= target.amount

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  // response
  description = `:scroll: ${message.member.displayName} 召喚的英雄 :${userHero.species}:** ${userHero.name}** 吃了 ${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}，恢復 ${feedGain} 點飽食度，獲得 ${expGain} 點經驗值`
  if (stampAmount) {
    description += `，獲得 ${items[28].icon}**${items[28].displayName}**x${stampAmount}`
  }

  return { description }
}
