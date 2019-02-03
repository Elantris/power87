const fs = require('fs')
const Discord = require('discord.js')
const firebase = require('firebase')

const config = require('./config')
const client = new Discord.Client()
firebase.initializeApp(config.FIREBASE)
let database = firebase.database()

// * banlist inition
let banlist = {}
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

const alias = require('./alias')
const energy = require('./energy')

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
  if (banlist[userId]) {
    if (message.createdAt.getTime() > banlist[userId]) {
      let ban = {}
      ban[userId] = null
      database.ref(`/banlist/`).update(ban)
    } else {
      return
    }
  }

  database.ref(`/energies/${serverId}`).once('value').then(snapshot => {
    // prevent default
    let energies = snapshot.val() || { _keep: 1 }

    if (!energies[userId]) {
      energy.inition({ energies, userId })
    }

    // add user to ban list
    if (energies[userId]._ban && energies[userId]._ban > 19) {
      let ban = {}
      ban[userId] = message.createdAt.getTime() + 24 * 60 * 60 * 1000
      energies[userId]._ban = null
      database.ref('/banlist/').update(ban)
      database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])
      return
    }

    if (!message.content.startsWith('87')) {
      energy.gainFromMessage({ energies, database, message, serverId, userId })
    } else {
      // process command
      let userCmd = ''
      let args = message.content.replace(/  +/g, ' ').split(' ')

      if (args[0] === '87') {
        userCmd = 'res'
      } else if (message.content[2] === '!') {
        userCmd = args[0].substring(3).toLowerCase()
        userCmd = alias[userCmd] || userCmd
      }

      if (commands[userCmd]) {
        commands[userCmd]({ args, client, database, energies, message, serverId, userId })
      }
    }
  })
})

client.login(config.TOKEN)

client.on('ready', () => {
  console.log('I am ready!')
  energy.gainFromVoiceChannel({ client, database })
})
