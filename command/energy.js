const energySystem = require('../util/energySystem')

module.exports = async ({ args, database, message, guildId, userId }) => {
  let userEnergy = await database.ref(`energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
  }

  return { description: `:battery: ${message.member.displayName} 擁有 ${parseInt(userEnergy)} 點八七能量` }
}
