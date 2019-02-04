const sendErrorMessage = require('../util/sendErrorMessage')

const energyCost = 20

module.exports = ({ args, database, energies, message, serverId, userId }) => { // remove the response from the keyword
  // check user energy
  if (energies[userId].a < energyCost) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  // check command format
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let term = args[1]
  let position = parseInt(args[2])

  database.ref(`/responses/${serverId}`).once('value').then(snapshot => {
    let responses = snapshot.val()

    // check term and response exists
    if (!Number.isSafeInteger(position) || !responses[term] || !responses[term][position]) {
      sendErrorMessage(message, 'ERROR_NOT_FOUND')
      return
    }

    responses[term][position] = null
    energies[userId].a -= energyCost

    database.ref(`/responses/${serverId}`).update(responses)
    database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:fire: 成功移除了 **${term}** 的第 **${position}** 個項目`
      }
    })
  })
}
