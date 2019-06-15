const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

let rarityUp = {
  costs: [0, 4, 8, 16, 32],
  chances: [0, 0.81, 0.27, 0.09, 0.03]
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (!args[1]) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

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

    if (!userInventory.items['40'] || userInventory.items['40'] < rarityUp.costs[userHero.rarity]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_ENOUGH' })
      return
    }

    description = `:arrow_double_up: ${message.member.displayName} 消耗了 :star:**英雄強化石**x${rarityUp.costs[userHero.rarity]}\n\n`

    userInventory.items['40'] -= rarityUp.costs[userHero.rarity]

    let luck = Math.random()
    if (luck < rarityUp.chances[userHero.rarity] * (1 + 0.01 * userHero.level)) {
      userHero.rarity += 1
      description += `強化星數成功！英雄稀有度提升一階，:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}`
    } else {
      description += '強化星數失敗，維持原貌，'
    }
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
