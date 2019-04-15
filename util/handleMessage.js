const fs = require('fs')

const alias = require('./alias')
const isCoolingDown = require('./isCoolingDown')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => !filename.startsWith('.')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`../command/${cmd}`)
})

// * main message
module.exports = ({ client, database, message, guildId, userId }) => {
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

  if (!commands[userCmd] || isCoolingDown({ userCmd, message, guildId, userId })) {
    return
  }

  // call command
  commands[userCmd]({ args, client, database, message, guildId, userId })
}
