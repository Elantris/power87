const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

let enhanceRarity = {
  costs: [0, 4, 8, 16, 32],
  chances: [0, 0.81, 0.27, 0.09, 0.03]
}

let abilities = {
  str: '力量',
  vit: '體能',
  int: '智慧',
  agi: '敏捷',
  luk: '幸運'
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (!args[1]) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  args[1] = args[1].toLowerCase()

  let userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero.name) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_HERO' })
    return
  }
  if (userHero.status === 'dead') {
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_DEAD' })
    return
  }

  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let description

  // enhance type
  if (args[1] === 'rarity') {
    if (userHero.rarity === 5) {
      sendResponseMessage({ message, errorCode: 'ERROR_MAX_RARITY' })
      return
    }

    if (!userInventory.items['40'] || userInventory.items['40'] < enhanceRarity.costs[userHero.rarity]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_ENOUGH' })
      return
    }

    description = `:arrow_double_up: ${message.member.displayName} 消耗 :star:**英雄星數強化石**x${enhanceRarity.costs[userHero.rarity]} 試圖強化英雄\n\n`

    userInventory.items['40'] -= enhanceRarity.costs[userHero.rarity]

    let luck = Math.random()
    if (luck < enhanceRarity.chances[userHero.rarity] * (1 + 0.01 * userHero.level)) {
      userHero.rarity += 1
      description += `強化成功！英雄稀有度提升一階，:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}`
    } else {
      description += '強化失敗，維持原狀，'
    }
  } else if (args[1] in abilities) {
    let amount = parseInt(args[2] || 1)

    if (!userInventory.items['42'] || userInventory.items['42'] < amount) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_ENOUGH' })
      return
    }

    let total = 0
    for (let i in abilities) {
      total += userHero[i]
    }

    if (total + amount > userHero.level) {
      sendResponseMessage({ message, errorCode: 'ERROR_MAX_ABILITY' })
      return
    }

    userInventory.items['42'] -= amount
    userHero[args[1]] += amount

    description = `:arrow_double_up: ${message.member.displayName} 消耗 :sparkles:**英雄體質強化粉末**x${amount}\n\n` +
      `:${userHero.species}: **${userHero.name}** 的 **${abilities[args[1]]}** 提升 ${amount} 點，\`${args[1].toUpperCase()}\`: ${userHero[args[1]]}`
  } else {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  // response
  sendResponseMessage({ message, description })
}
