const heroSystem = require('../util/heroSystem')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero.name) {
    return { errorCode: 'ERROR_NO_HERO' }
  }
  if (userHero.status === 'dead') {
    database.ref(`/hero/${guildId}/${userId}`).remove()
    return { errorCode: 'ERROR_HERO_DEAD' }
  }

  if (!args[1] || args[1] !== userHero.name) {
    return { errorCode: 'ERROR_HERO_NAME' }
  }

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  userEnergy = userEnergy.val()
  let energyGain = Math.floor(userHero.exp * 0.5 + userHero.rarity * 50)

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + energyGain)
  database.ref(`/hero/${guildId}/${userId}`).remove()

  // response
  return { description: `:scroll: ${message.member.displayName} 讓 :${userHero.species}: **${userHero.name}** 回歸自由，臨別之前他留下了 ${energyGain} 點八七能量` }
}
