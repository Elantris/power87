const fs = require('fs')

const alias = require('./alias')
const isCoolingDown = require('./isCoolingDown')
const energySystem = require('./energySystem')
const sendResponseMessage = require('./sendResponseMessage')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => !filename.startsWith('.')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`../command/${cmd}`)
})

// * main message
module.exports = ({ client, database, message, guildId, userId }) => {
  if (!message.content.startsWith('87')) {
    if (!isCoolingDown({ userCmd: 'gainFromMessage', message, userId })) {
      energySystem.gainFromTextChannel({ database, guildId, userId })
    }
    return
  }

  // parse command
  let userCmd = ''
  let args = message.content.replace(/  +/g, ' ').split(' ')

  if (args[0] === '87') {
    if (args.length === 1) {
      return
    }
    userCmd = 'res'
  } else if (message.content[2] === '!') {
    userCmd = args[0].substring(3).toLowerCase()
    userCmd = alias[userCmd] || userCmd
  }

  if (!commands[userCmd]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_COMMAND', fade: true })
    return
  }

  if (isCoolingDown({ userCmd, message, userId })) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_COOLING', fade: true })
    return
  }

  // call command
  commands[userCmd]({ args, client, database, message, guildId, userId })
}
