const fs = require('fs')
const config = require('./config')

const Discord = require('discord.js')
const client = new Discord.Client()

const firebase = require('firebase')
firebase.initializeApp(config.FIREBASE)
const database = firebase.database()

const alias = require('./util/alias')
const energy = require('./util/energy')
const isBanned = require('./util/isBanned')
const isCoolingDown = require('./util/isCoolingDown')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`./command/${cmd}`)
})

// * main response
let logs = {}
let allowlist = {}
let banlist = {}
database.ref('/allowlist').on('value', snapshot => {
  allowlist = snapshot.val()
})
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

client.on('message', message => {
  if (message.author.bot || isBanned.guild(allowlist, banlist, message.guild.id) || isBanned.user(banlist, message.author.id)) {
    return
  }

  let guildId = message.guild.id
  let userId = message.author.id

  if (!message.content.startsWith('87')) {
    if (isCoolingDown({ userCmd: 'gainFromMessage', message, guildId, userId })) {
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

    // repeat detection
    logs[userId] = logs[userId] || []
    logs[userId].push({
      t: message.createdTimestamp,
      c: message.content
    })

    if (logs[userId].length === 50) {
      logs[userId] = logs[userId].filter(log => log.t > message.createdTimestamp - 10 * 60 * 1000) // 10 min
      if (logs[userId].length === 50) {
        database.ref(`/banlist/${userId}`).set(1)
        fs.writeFileSync(`./banlist/${userId}.txt`, logs[userId].map(log => `${log.t}: ${log.c}`).join('\n'), { encoding: 'utf8' })
        delete logs[userId]
        return
      }
    }

    if (!commands[userCmd] || isCoolingDown({ userCmd, message, guildId, userId })) {
      return
    }

    // call command
    database.ref(`/energies/${guildId}`).once('value').then(snapshot => {
      let energies = snapshot.val() || { _keep: 1 }
      if (!energies[userId]) {
        energy.inition({ energies, userId })
      }
      commands[userCmd]({ args, client, database, energies, message, guildId, userId })
    })
  }
})

client.login(config.TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  energy.gainFromVoiceChannel({ client, database })
})
