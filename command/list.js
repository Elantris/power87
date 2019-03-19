const sendErrorMessage = require('../util/sendErrorMessage')

module.exports = ({ args, database, message, guildId }) => {
  database.ref(`/responses/${guildId}`).once('value').then(snapshot => {
    let responses = snapshot.val() || { _keep: 1 }

    // check command format
    if (args.length > 1 && !responses[args[1]]) {
      sendErrorMessage(message, 'ERROR_NOT_FOUND')
      return
    }

    let output = ':bookmark_tabs: '

    if (args.length === 1) {
      // list all keywords from server
      output += `所有關鍵字 [${Object.keys(responses).length - 1}/100]\n`
      for (let i in responses) {
        if (i.startsWith('_')) {
          continue
        }
        output += `\n${i} (${Object.keys(responses[i]).length})`
      }
    } else {
      // list all responses of the keyword
      let target = responses[args[1]]
      output += `**${args[1]}** 的回應列表 [${Object.keys(target).length}/50]\n`
      for (let i in target) {
        output += `\n${i}. ${target[i]}`
      }
    }
    output += '\n'

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: output
      }
    })
  })
}
