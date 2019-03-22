const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')

const energyCost = 20

module.exports = ({ args, database, message, guildId, userId }) => {
  // check command format
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let term = args[1]
  let position = parseInt(args[2])

  database.ref(`/note/${guildId}/${term}/${position}`).once('value').then(snapshot => {
    if (!snapshot.val()) {
      sendErrorMessage(message, 'ERROR_NOT_FOUND')
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
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)

      database.ref(`/note/${guildId}/${term}/${position}`).remove()

      message.channel.send({
        embed: {
          color: 0xffe066,
          description: `:fire: 成功移除了 **${term}** 的第 **${position}** 個項目`
        }
      })
    })
  })
}
