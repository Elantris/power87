const fs = require('fs')
const Discord = require('discord.js')
const firebase = require('firebase')

const config = require('./config')
const client = new Discord.Client()
firebase.initializeApp(config.FIREBASE)
let database = firebase.database()

// * banlist inition
let logs = {}
let banlist = {}
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

const alias = require('./util/alias')
const isCoolingDown = require('./util/isCoolingDown')
const energy = require('./util/energy')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`./command/${cmd}`)
})

// * main response
client.on('message', message => {
  if (message.author.bot) {
    return
  }

  let userId = message.author.id
  let serverId = message.guild.id

  // check ban list
  if (banlist[userId] || banlist[serverId]) {
    return
  }

  if (!message.content.startsWith('87')) {
    // gain energies from text channel
    if (isCoolingDown({ userCmd: 'gainFromMessage', message, serverId, userId })) {
      return
    }

    database.ref(`/energies/${serverId}`).once('value').then(snapshot => {
      let energies = snapshot.val() || { _keep: 1 }

      if (!energies[userId]) {
        energy.inition({ energies, userId })
      }

      energies[userId].a += 1
      database.ref(`/energies/${serverId}`).update(energies)
    })
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
    logs[userId] = logs[userId] || {}
    logs[userId][userCmd] = logs[userId][userCmd] || []
    logs[userId][userCmd].push({
      t: message.createdTimestamp,
      c: message.content
    })

    if (logs[userId][userCmd].length === 40) {
      logs[userId][userCmd] = logs[userId][userCmd].filter(log => log.t > message.createdTimestamp - 10 * 60 * 1000)
      if (logs[userId][userCmd].length === 40) {
        database.ref(`/banlist/${userId}`).set(1)
        fs.writeFileSync(`./banlist/${userId}.txt`, logs[userId][userCmd].map(log => `${log.t}: ${log.c}`).join('\n'), { encoding: 'utf8' })
        delete logs[userId]
        return
      }
    }

    if (!commands[userCmd] || isCoolingDown({ userCmd, message, serverId, userId })) {
      return
    }

    // call command
    database.ref(`/energies/${serverId}`).once('value').then(snapshot => {
      // prevent default
      let energies = snapshot.val() || { _keep: 1 }

      if (!energies[userId]) {
        energy.inition({ energies, userId })
      }

      commands[userCmd]({ args, client, database, energies, message, serverId, userId })
    })
  }
})

client.login(config.TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  energy.gainFromVoiceChannel({ client, database })
})
