const hintSystem = require('../util/hintSystem')

module.exports = async ({ args, database, message, guildId, userId }) => {
  let hint = ''
  if (args.length > 1 && Number.isSafeInteger(parseInt(args[1]))) {
    hint = hintSystem(args[1])
    if (hint === -1) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }
  } else {
    hint = hintSystem()
  }

  return { description: hint }
}
