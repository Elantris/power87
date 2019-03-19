const sendErrorMessage = require('../util/sendErrorMessage')

const maxTermNum = 100
const maxResNum = 50
const energyCost = 10

module.exports = ({ args, database, energies, message, guildId, userId }) => { // add keywords to list
  // check user energy
  if (energies[userId].a < energyCost) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  // check command format
  if (args.length < 3 || args[1].startsWith('_') || Number.isSafeInteger(parseInt(args[1]))) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let term = args[1]

  // check term legnth
  if (term.length > 20) {
    sendErrorMessage(message, 'ERROR_LENGTH_EXCEED')
    return
  }

  database.ref(`/responses/${guildId}`).once('value').then(snapshot => {
    let responses = snapshot.val() || { _keep: 1 }

    if (!responses[term]) {
      // check number of terms in server
      let currentTermNum = Object.keys(responses).length - 1
      if (currentTermNum >= maxTermNum) {
        sendErrorMessage(message, 'ERROR_TERMS_EXCEED')
        return
      }
      responses[term] = {}
    }

    // check length of response list
    let emptyPosition = 1
    for (emptyPosition; emptyPosition <= maxResNum; emptyPosition++) {
      if (!responses[term][emptyPosition]) {
        break
      }
    }
    if (emptyPosition > maxResNum) {
      sendErrorMessage(message, 'ERROR_RES_EXCEED')
      return
    }

    // add term and response
    let newResponse = args.slice(2).join(' ')
    responses[term][emptyPosition] = newResponse
    energies[userId].a -= energyCost

    database.ref(`/responses/${guildId}`).update(responses)
    database.ref(`/energies/${guildId}/${userId}`).update(energies[userId])

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:white_check_mark: 你說 **87 ${term} ${emptyPosition}** 我說 **${newResponse}**`
      }
    })
  })
}
