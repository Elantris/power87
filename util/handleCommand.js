const fs = require('fs')

const alias = require('./alias')
const isCoolingDown = require('./isCoolingDown')
const energySystem = require('./energySystem')
const sendResponse = require('./sendResponse')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => !filename.startsWith('.')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`../command/${cmd}`)
})

// * main message
module.exports = async ({ client, database, settings, message, guildId, userId }) => {
  if (!message.content.startsWith('87')) {
    if (!isCoolingDown({ userCmd: 'gainFromMessage', message, userId })) {
      energySystem.gainFromTextChannel({ database, guildId, userId })
    }
    return
  }

  // parse command
  let userCmd = ''
  let args = message.content.replace(/  +/g, ' ').split(' ')

  if (args[0].startsWith('87!')) {
    userCmd = args[0].substring(3).toLowerCase()
    userCmd = alias[userCmd] || userCmd
  } else if (args[0] === '87') {
    if (args.length === 1) {
      return
    }
    userCmd = 'res'
  } else {
    return
  }

  if (!commands[userCmd]) {
    sendResponse({ message, errorCode: 'ERROR_NO_COMMAND', fade: true })
    return
  }

  if (isCoolingDown({ userCmd, message, userId })) {
    sendResponse({ message, errorCode: 'ERROR_IS_COOLING', fade: true })
    return
  }

  // call command
  let response = await commands[userCmd]({ args, client, database, message, guildId, userId }) || {}

  let fade = true
  if (settings[guildId] && settings[guildId] === message.channel.id) {
    fade = false
  }

  if (response.errorCode) {
    sendResponse({ message, errorCode: response.errorCode, fade })
  } else if (response.description) {
    sendResponse({ message, description: response.description, content: response.content, fade })
  }
}
