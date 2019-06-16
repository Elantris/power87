const hintSystem = require('../util/hintSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let hint = ''
  if (args.length > 1 && Number.isSafeInteger(parseInt(args[1]))) {
    hint = hintSystem(args[1])
    if (hint === -1) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }
  } else {
    hint = hintSystem()
  }

  sendResponseMessage({ message, description: hint })
}
