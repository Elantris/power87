const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
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
  let description = ''
  let target = {}
  if (args[1]) {
    let results = findTargets(args[1].toLowerCase())

    if (results.length === 0) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (results.length > 1) {
      description = `:arrow_double_up: 指定其中一種道具/物品：\n`
      results.filter(result => items[result.id].feed).forEach(result => {
        let item = items[result.id]
        description += `\n${item.icon}**${item.displayName}**，\`${item.kind}/${item.name}\`，\`87!feed ${item.name}\``
      })
      sendResponseMessage({ message, description })
      return
    }

    target = results[0]
    target.kind = items[target.id].kind
    target.amount = parseInt(args[2] || 1)

    if (!usableKinds[target.kind]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_USABLE' })
      return
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (args.length === 1) { // list all usable items
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以餵食英雄的物品：\n`

    for (let id in userInventory.items) {
      if (usableKinds[items[id].kind]) {
        description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}，**+${items[id].feed}**，\`87!feed ${items[id].name}\``
      }
    }

    sendResponseMessage({ message, description })
    return
  }

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  if (!userInventory.items[target.id]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
    return
  }

  if (target.amount > userInventory.items[target.id]) {
    target.amount = userInventory.items[target.id]
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
  let maxUseAmount = Math.ceil(hunger / items[target.id].feed)
  if (target.amount > maxUseAmount) {
    target.amount = maxUseAmount
  }

  let feedGain = items[target.id].feed * target.amount
  userHero.feed += feedGain
  if (userHero.feed > userHero.maxFeed) {
    feedGain = hunger
    userHero.feed = userHero.maxFeed
  }

  userHero.exp += Math.floor(Math.random() * (feedGain - target.amount) + target.amount)

  userInventory.items[target.id] -= target.amount

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

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  // response
  description = `:scroll: ${message.member.displayName} 召喚的英雄 :${userHero.species}:** ${userHero.name}** 吃了 ${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}，恢復 ${feedGain} 點飽食度`
  sendResponseMessage({ message, description })
}