const Discord = require('discord.js')
const firebase = require('firebase')

const config = require('./config')
const isCoolingDown = require('./util/isCoolingDown')
const handleMessage = require('./util/handleMessage')
const energySystem = require('./util/energySystem')

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
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

// handle message
client.on('message', message => {
  if (message.channel.type === 'dm') {
    if (message.author.id === client.user.id) {
      return
    }

    message.reply(':stuck_out_tongue_winking_eye: Power87 目前沒有提供私訊服務，請參照開發文件說明或填寫意見調查表\n\n:loudspeaker: 公告頁面：<https://hackmd.io/s/VkLSj2pOJW>\n\n:envelope: 意見調查：<https://forms.gle/9iYELzNoQ2JRDKeR7>')

    for (let adminId in config.admins) {
      client.fetchUser(adminId).then(user => {
        user.send(`**${message.author.username}**: ${message.content}`)
      })
    }
    return
  }

  let guildId = message.guild.id
  let userId = message.author.id

  if (message.author.bot) {
    return
  }

  if (banlist[userId]) {
    if (banlist[userId] > message.createdTimestamp) {
      return
    }
    database.ref(`/banlist/${userId}`).remove()
  }

  if (!message.content.startsWith('87')) {
    if (!isCoolingDown({ userCmd: 'gainFromMessage', message, userId })) {
      energySystem.gainFromTextChannel({ database, guildId, userId })
    }
    return
  }

  handleMessage({ client, database, message, guildId, userId })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  setInterval(() => {
    energySystem.gainFromVoiceChannel({ client, banlist, database })
  }, config.tick)
})

client.login(config.TOKEN)
