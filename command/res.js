const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (args.length === 1) {
    return
  }

  let term = args[1]
  let choice = args[2]

  database.ref(`/note/${guildId}/${term}`).once('value').then(snapshot => {
    let responses = snapshot.val()
    if (!responses) {
      return
    }

    if (args.length === 2) {
      let candidates = Object.keys(responses)
      choice = candidates[~~(Math.random() * candidates.length)]
    } else if (!responses[choice]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    message.channel.send(responses[choice])
  })
}
