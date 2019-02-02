const fs = require('fs')
const Discord = require('discord.js')
const firebase = require('firebase')

const config = require('./config')
const client = new Discord.Client()
firebase.initializeApp(config.FIREBASE)
let database = firebase.database()

const alias = require('./alias')
const energy = require('./energy')

// * load commands
let commands = {}
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`./command/${cmd}`)
})

// * main response
let banList = {}
client.on('message', message => {
  if (message.author.bot) {
    return
  }

  let userId = message.author.id
  let serverId = message.guild.id

  if (banList[userId]) {
    if (Date.now() > banList[userId]) {
      delete banList[userId]
    } else {
      return
    }
  }

  firebase.database().ref(`/energies/${serverId}`).once('value').then(snapshot => {
    // prevent default
    let energies = snapshot.val() || { _keep: 1 }

    if (!energies[userId]) {
      energy.inition({ energies, userId })
    }

    // ban list
    if (energies[userId]._ban && energies[userId]._ban > 9) {
      banList[userId] = Date.now() + 24 * 60 * 60 * 1000
      energies[userId]._ban = null
      database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])
      return
    }

    if (!message.content.startsWith('87')) {
      energy.gainFromMessage({ energies, userId })
      firebase.database().ref(`/energies/${serverId}`).update(energies)
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
