const config = require('../config')
const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const energyCost = 100
const rarityChances = [
  0.65,
  0.30,
  0.03,
  0.015,
  0.005
]

let getRarity = () => {
  let luck = Math.random()
  for (let i in rarityChances) {
    if (luck < rarityChances[i]) {
      return parseInt(i) + 1
    }
    luck -= rarityChances[i]
  }
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length !== 2) {
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_NAME' })
    return
  }

  if (args[1].length > 20) { // hero name
    sendResponseMessage({ message, errorCode: 'ERROR_LENGTH_EXCEED' })
    return
  }

  // hero system
  let heroRaw = await database.ref(`/hero/${guildId}/${userId}`).once('value')
  if (heroRaw.exists()) {
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_EXISTS' })
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
  let heroSpecies = heroSystem.species[Math.floor(Math.random() * heroSystem.species.length)]
  let heroRarity = getRarity()
  let timeGap = Math.floor(message.createdTimestamp / config.tick)

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  database.ref(`/hero/${guildId}/${userId}`).set(`${args[1]};${heroSpecies};${heroRarity};0;100;${timeGap}:stay`)

  sendResponseMessage({ message, description: `:scroll: ${message.member.displayName} 消耗 ${energyCost} 點八七能量召喚出 ${heroSystem.rarityDisplay(heroRarity)} :${heroSpecies}:**${args[1]}**！` })
}
