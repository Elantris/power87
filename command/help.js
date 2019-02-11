const fs = require('fs')
const alias = require('../util/alias')
const sendErrorMessage = require('../util/sendErrorMessage')
const encoding = 'utf8'

let manuals = {}
fs.readdirSync('./manual/').filter(filename => filename.endsWith('.md')).forEach(filename => {
  let cmd = filename.split('.md')[0]
  manuals[cmd] = fs.readFileSync(`./manual/${cmd}.md`, { encoding })
})

module.exports = ({ args, message }) => {
  if (args.length === 1) {
    message.channel.send({
      embed: {
        color: 0xffe066,
        description: manuals.default
      }
    })
    return
  }

  let cmd = args[1].toLowerCase()
  cmd = alias[cmd] || cmd

  if (!manuals[cmd]) {
    sendErrorMessage(message, 'ERROR_NOT_FOUND')
    return
  }

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: manuals[cmd]
    }
  })
}
