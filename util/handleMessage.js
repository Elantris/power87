const fs = require('fs')

const alias = require('./alias')
const energy = require('./energy')
const isCoolingDown = require('./isCoolingDown')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`../command/${cmd}`)
})

// * main message
let cmdLogs = {}

module.exports = ({ client, database, message, fishing, guildId, userId }) => {
  if (message.author.bot) {
    return
  }

  if (!message.content.startsWith('87')) {
    if (isCoolingDown({ userCmd: 'gainFromMessage', message, userId })) {
      return
    }
    energy.gainFromTextChannel({ database, guildId, userId })
  } else {
    // parse command
    let userCmd = ''
    let args = message.content.replace(/  +/g, ' ').split(' ')

    if (args[0] === '87') {
      userCmd = 'res'
    } else if (message.content[2] === '!') {
      userCmd = args[0].substring(3).toLowerCase()
      userCmd = alias[userCmd] || userCmd
    }

    // command history
    cmdLogs[userId] = cmdLogs[userId] || []
    cmdLogs[userId].push({
      t: message.createdTimestamp,
      c: message.content
    })

    // repeat detection
    if (cmdLogs[userId].length === 60) {
      cmdLogs[userId] = cmdLogs[userId].filter(log => log.t > message.createdTimestamp - 10 * 60 * 1000) // 10 min
      if (cmdLogs[userId].length === 60) {
        database.ref(`/banlist/${userId}`).set(message.createdTimestamp + 60 * 60 * 1000) // 1 hr
        fs.writeFileSync(`./banlist/${userId}.txt`, cmdLogs[userId].map(log => `${log.t}: ${log.c}`).join('\n'), { encoding: 'utf8' })
        delete cmdLogs[userId]
        return
      }
    }

    if (!commands[userCmd] || isCoolingDown({ userCmd, message, guildId, userId })) {
      return
    }

    // call command
    commands[userCmd]({ args, client, database, fishing, message, guildId, userId })
  }
}
