const energySystem = require('../util/energySystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const energyCost = 15

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  // check command format
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let term = args[1]
  let position = parseInt(args[2])

  let note = await database.ref(`/note/${guildId}/${term}/${position}`).once('value')
  if (!note.exists()) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
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
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
    return
  }

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  database.ref(`/note/${guildId}/${term}/${position}`).remove()

  // response
  sendResponseMessage({ message, description: `:fire: 成功移除了 **${term}** 的第 **${position}** 個項目` })
}
