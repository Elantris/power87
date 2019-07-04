const energySystem = require('../util/energySystem')

const energyCost = 15

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    return { errorCode: 'ERROR_FORMAT' }
  }

  let term = args[1]
  let position = parseInt(args[2])

  let note = await database.ref(`/note/${guildId}/${term}/${position}`).once('value')
  if (!note.exists()) {
    return { errorCode: 'ERROR_NOT_FOUND' }
  }

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
  }

  if (userEnergy < energyCost) {
    return { errorCode: 'ERROR_NO_ENERGY' }
  }

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  database.ref(`/note/${guildId}/${term}/${position}`).remove()

  // response
  return { description: `:fire: 成功移除了 **${term}** 的第 **${position}** 個項目` }
}
