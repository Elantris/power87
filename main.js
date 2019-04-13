const Discord = require('discord.js')
const firebase = require('firebase')

const config = require('./config')
const energySystem = require('./util/energySystem')
const handleMessage = require('./util/handleMessage')

const client = new Discord.Client()
firebase.initializeApp(config.FIREBASE)
const database = firebase.database()

// init database
database.ref('/banlist/').update({ _keep: 1 })
database.ref('/energy/').update({ _keep: 1 })
database.ref('/fishing/').update({ _keep: 1 })
database.ref('/inventory/').update({ _keep: 1 })
database.ref('/lastUsed/').update({ _keep: 1 })
database.ref('/note/').update({ _keep: 1 })

let banlist = {}
let fishing = {}
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})
database.ref('/fishing').on('value', snapshot => {
  fishing = snapshot.val()
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

  handleMessage({ client, database, fishing, message, guildId, userId })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  setInterval(() => {
    energySystem.gainFromVoiceChannel({ client, banlist, database, fishing })
  }, config.tick)
})

client.login(config.TOKEN)
