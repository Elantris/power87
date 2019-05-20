const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, database, message, guildId, userId }) => {
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

  if (!args[1] || args[1] !== userHero.name) {
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_NAME' })
    return
  }

  // energy system
  let energyGain = Math.floor(userHero.exp * 0.5)
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  userEnergy = userEnergy.val()

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + energyGain)
  database.ref(`/hero/${guildId}/${userId}`).remove()

  sendResponseMessage({ message, description: `:scroll: ${message.member.displayName} 讓 :${userHero.species}: **${userHero.name}** 回歸自由，臨別之前他留下了 ${energyGain} 點八七能量` })
}
