const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const energyCost = 3000

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (!args[1]) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let heroSpecies = args[1].toLowerCase()

  if (heroSystem.species.indexOf(heroSpecies) === -1) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_SPECIES' })
    return
  }

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  userEnergy = userEnergy.val()
  if (!userEnergy || userEnergy < energyCost) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
    return
  }

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

  userHero.species = heroSpecies

  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  database.ref(`/hero/${guildId}/${userId}`).set(heroSystem.make(userHero, message.createdTimestamp))

  sendResponseMessage({ message, description: `:scroll: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量變更了英雄的外型 :${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}` })
}
