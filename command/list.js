const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ args, database, message, guildId }) => {
  let output = ':bookmark_tabs: '

  if (args.length === 1) {
    database.ref(`/note/${guildId}`).once('value').then(snapshot => {
      let notes = snapshot.val()

      output += '所有關鍵字\n'
      for (let term in notes) {
        output += `\n${term} (${Object.keys(notes[term]).length})`
      }

      sendResponseMessage({ message, description: output })
    })
  } else {
    let term = args[1]
    database.ref(`/note/${guildId}/${term}`).once('value').then(snapshot => {
      let responses = snapshot.val()
      if (!responses) {
        sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
        return
      }

      output += `**${term}** 的回應列表 [${Object.keys(responses).length}/50]\n`
      for (let index in responses) {
        output += `\n${index}. ${responses[index]}`
      }

      sendResponseMessage({ message, description: output })
    })
  }
}
