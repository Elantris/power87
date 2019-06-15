const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let output = ':bookmark_tabs: '

  if (args.length === 1) {
    let notes = await database.ref(`/note/${guildId}`).once('value')
    notes = notes.val()

    output += '所有關鍵字\n'
    for (let term in notes) {
      output += `\n${term} (${Object.keys(notes[term]).length})`
    }

    sendResponseMessage({ message, description: output })
  } else {
    let term = args[1]
    let responses = await database.ref(`/note/${guildId}/${term}`).once('value')
    if (!responses.exists()) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }
    responses = responses.val()

    output += `**${term}** 的回應列表 [${Object.keys(responses).length}/50]\n`
    for (let index in responses) {
      output += `\n${index}. ${responses[index]}`
    }

    sendResponseMessage({ message, description: output })
  }
}
