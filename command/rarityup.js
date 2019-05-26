const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const upCosts = [0, 400, 800, 1600, 3200]
const upChances = [0, 0.81, 0.27, 0.09, 0.03]

module.exports = async ({ args, database, message, guildId, userId }) => {
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

  if (userHero.rarity === 5) {
    sendResponseMessage({ message, errorCode: 'ERROR_MAX_RARITY' })
    return
  }

  // energy system
  let energyCost = upCosts[userHero.rarity]
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  userEnergy = userEnergy.val()
  if (!userEnergy || userEnergy < energyCost) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
    return
  }

  let description = `:scroll: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，:${userHero.species}: **${userHero.name}** `

  let luck = Math.random()
  if (luck < upChances[userHero.rarity]) {
    userHero.rarity += 1
    description += `突破成功，提升星數 ${heroSystem.rarityDisplay(userHero.rarity)}！`
  } else {
    description += `突破失敗，維持原狀`
  }

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  sendResponseMessage({ message, description })
}
