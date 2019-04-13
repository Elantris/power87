const hints = require('../util/hints')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ args, message }) => {
  let hint = ''
  if (args.length > 1 && Number.isSafeInteger(parseInt(args[1]))) {
    hint = hints(args[1])
    if (hint === -1) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }
  } else {
    hint = hints()
  }

  sendResponseMessage({ message, description: hint })
}
