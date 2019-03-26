const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')

const maxResNum = 50
const energyCost = 10

module.exports = ({ args, database, message, guildId, userId }) => {
  // check command format
  if (args.length < 3 || args[1].startsWith('_') || Number.isSafeInteger(parseInt(args[1]))) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  // check term legnth
  let term = args[1]
  if (term.length > 20) {
    sendErrorMessage(message, 'ERROR_LENGTH_EXCEED')
    return
  }

  database.ref(`/note/${guildId}/${term}`).once('value').then(snapshot => {
    let notes = snapshot.val() || {}
    let updates = {}

    let emptyPosition
    for (emptyPosition = 1; emptyPosition <= maxResNum; emptyPosition++) {
      if (!notes[emptyPosition]) {
        break
      }
    }
    if (emptyPosition > maxResNum) {
      sendErrorMessage(message, 'ERROR_RES_EXCEED')
      return
    }

    database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energy.INITIAL_USER_ENERGY
        database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      }
      if (userEnergy < energyCost) {
        sendErrorMessage(message, 'ERROR_NO_ENERGY')
        return
      }

      let newResponse = args.slice(2).join(' ')
      updates[emptyPosition] = newResponse

      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
      database.ref(`/note/${guildId}/${term}`).update(updates)

      message.channel.send({
        embed: {
          color: 0xffe066,
          description: `:white_check_mark: 你說 **87 ${term} ${emptyPosition}** 我說 **${newResponse}**`
        }
      })
    })
  })
}
