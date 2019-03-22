const Discord = require('discord.js')
const firebase = require('firebase')

const config = require('./config')
const energy = require('./util/energy')
const handleMessage = require('./util/handleMessage')

const client = new Discord.Client()
firebase.initializeApp(config.FIREBASE)
const database = firebase.database()

// init database
database.ref('/banlist/').update({ _keep: 1 })
database.ref('/energy/').update({ _keep: 1 })
database.ref('/lastUsed/').update({ _keep: 1 })
database.ref('/note/').update({ _keep: 1 })

let banlist = {}
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

// handle message
client.on('message', message => {
  let guildId = message.guild.id
  let userId = message.author.id

  if (message.author.bot || banlist[guildId]) {
    return
  }

  if (banlist[userId]) {
    if (banlist[userId] > message.createdTimestamp) {
      return
    }
    database.ref(`/banlist/${userId}`).remove()
  }

  handleMessage({ client, database, message })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  setInterval(() => {
    energy.gainFromVoiceChannel({ client, banlist, database })
  }, 6 * 60 * 1000) // 6 min
})

client.login(config.TOKEN)
