const energySystem = require('../util/energySystem')

const maxResNum = 50
const energyCost = 10

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length < 3 || args[1].startsWith('_') || Number.isSafeInteger(parseInt(args[1]))) {
    return { errorCode: 'ERROR_FORMAT' }
  }

  // check term legnth
  let term = args[1]
  if (term.length > 20) {
    return { errorCode: 'ERROR_LENGTH_EXCEED' }
  }

  let notes = await database.ref(`/note/${guildId}/${term}`).once('value')
  notes = notes.val() || {}

  let emptyPosition
  for (emptyPosition = 1; emptyPosition <= maxResNum; emptyPosition++) {
    if (!notes[emptyPosition]) {
      break
    }
  }
  if (emptyPosition > maxResNum) {
    return { errorCode: 'ERROR_RES_EXCEED' }
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
  let newResponse = args.slice(2).join(' ')
  let updates = {}
  updates[emptyPosition] = newResponse

  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  database.ref(`/note/${guildId}/${term}`).update(updates)

  // response
  return { description: `:white_check_mark: 你說 **87 ${term} ${emptyPosition}** 我說 **${newResponse}**` }
}
