const fs = require('fs')
const config = require('../config')
const alias = require('./alias')
const energySystem = require('./energySystem')
const sendResponse = require('./sendResponse')

// * load commands
const commands = {}
fs.readdirSync('./command/').filter(filename => !filename.startsWith('.')).forEach(filename => {
  const cmd = filename.split('.js')[0]
  commands[cmd] = require(`../command/${cmd}`)
})

// * cool down
const cmdLastUsed = {}
const cmdCooldown = {
  add: 3,
  delete: 3,
  list: 15,

  energy: 3,
  daily: 15,
  give: 3,
  rank: 30,
  slot: 15,
  roll: 15,

  inventory: 5,
  buy: 3,
  sell: 3,
  fishing: 10,
  use: 3,
  mark: 10,

  hero: 5,
  free: 5,
  feed: 3,
  enhance: 5,
  refine: 5,
  tower: 30,

  help: 3,
  wiki: 3,
  hint: 3,
  clean: 15,

  res: 3,
  gainFromMessage: 120
}
if (config.ENV === 'development') {
  for (const i in cmdCooldown) {
    cmdCooldown[i] = 2000
  }
} else {
  for (const i in cmdCooldown) {
    cmdCooldown[i] *= 1000 // trasform to minisecond
  }
}

// * main message
module.exports = async ({ database, message, guildId, userId }) => {
  if (!cmdLastUsed[userId]) {
    cmdLastUsed[userId] = {}
  }

  // parse command
  let userCmd = ''
  const args = message.content.replace(/  +/g, ' ').split(' ')

  if (args[0].startsWith('87!')) {
    userCmd = args[0].substring(3).toLowerCase()
    userCmd = alias[userCmd] || userCmd
  } else if (args[0] === '87' && args[1]) {
    userCmd = 'res'
  } else {
    if (message.createdTimestamp - (cmdLastUsed[userId].gainFromMessage || 0) > cmdCooldown.gainFromMessage) {
      cmdLastUsed[userId].gainFromMessage = message.createdTimestamp
      energySystem.gainFromTextChannel({ database, guildId, userId })
    }
    return
  }

  if (!commands[userCmd]) {
    sendResponse({ message, errorCode: 'ERROR_NO_COMMAND' })
    return
  }

  if (message.createdTimestamp - (cmdLastUsed[userId].global || 0) < 1000 || message.createdTimestamp - (cmdLastUsed[userId][userCmd] || 0) < cmdCooldown[userCmd]) {
    sendResponse({ message, errorCode: 'ERROR_IS_COOLING', fade: true })
    return
  }
  cmdLastUsed[userId].global = message.createdTimestamp

  // call command
  const response = await commands[userCmd]({ args, database, message, guildId, userId }) || {}

  if (response.errorCode) {
    sendResponse({ message, errorCode: response.errorCode })
  } else if (response.description) {
    cmdLastUsed[userId][userCmd] = message.createdTimestamp
    sendResponse({ message, description: response.description, content: response.content })
  }
}
