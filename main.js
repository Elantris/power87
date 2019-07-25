const Discord = require('discord.js')
const firebase = require('firebase')

const config = require('./config')
const handleCommand = require('./util/handleCommand')
const energySystem = require('./util/energySystem')

const client = new Discord.Client()
firebase.initializeApp(config.FIREBASE)
const database = firebase.database()

// init banlist
let banlist = {}
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

// handle message
client.on('message', message => {
  if (message.author.bot || !message.member || message.author.id === client.user.id) {
    return
  }

  const guildId = message.guild.id
  const userId = message.author.id

  if (banlist[userId]) {
    if (banlist[userId] > message.createdTimestamp) {
      return
    }
    database.ref(`/banlist/${userId}`).remove()
  }

  handleCommand({ database, message, guildId, userId })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  setInterval(() => {
    energySystem.gainFromVoiceChannel({ client, banlist, database })
  }, config.tick)
})

client.login(config.TOKEN)
