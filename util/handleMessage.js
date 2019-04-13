const fs = require('fs')

const alias = require('./alias')
const energySystem = require('./energySystem')
const isCoolingDown = require('./isCoolingDown')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`../command/${cmd}`)
})

// * main message
module.exports = ({ client, database, message, fishing, guildId, userId }) => {
  if (!message.content.startsWith('87')) {
    if (isCoolingDown({ userCmd: 'gainFromMessage', message, userId })) {
      return
    }
    energySystem.gainFromTextChannel({ database, guildId, userId })
  } else {
    // parse command
    let userCmd = ''
    let args = message.content.replace(/  +/g, ' ').split(' ')

    if (args[0] === '87') {
      userCmd = 'res'
      if (!args[1]) {
        return
      }
    } else if (message.content[2] === '!') {
      userCmd = args[0].substring(3).toLowerCase()
      userCmd = alias[userCmd] || userCmd
    }

    if (!commands[userCmd] || isCoolingDown({ userCmd, message, guildId, userId })) {
      return
    }

    // call command
    commands[userCmd]({ args, client, database, fishing, message, guildId, userId })
  }
}
