const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config')
const client = new Discord.Client()

const alias = require('./alias')
const isModerator = require('./isModerator')
const energy = require('./energy')

// * get server list
let serverExist = {}
fs.readdirSync('./data/').forEach(v => {
  serverExist[v.split('.json')[0]] = 1
})

// * init commands
let commands = {}
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`./command/${cmd}`)
})

// * main response
let cache = {}
client.on('message', message => {
  if (message.author.bot) {
    return
  }

  let serverId = message.guild.id
  let userId = message.author.id

  // restore data from save file
  if (!cache[serverId]) {
    if (serverExist[serverId]) {
      cache[serverId] = require(`./data/${serverId}`)
    } else {
      cache[serverId] = {
        last: 0,
        responses: {},
        energies: {}
      }
    }
  }
  cache[serverId].last = Date.now()

  // energy system
  if (!cache[serverId].energies[userId]) {
    energy.inition({ cache, serverId, userId })
  }

  if (!message.content.startsWith('87')) {
    energy.gainFromMessage({ cache, serverId, userId })
    return
  }

  // process command
  let cmd = ''
  let args = message.content.replace(/  +/g, ' ').split(' ')
  if (args[0] === '87') {
    cmd = 'res'
  } else if (message.content[2] === '!') {
    cmd = args[0].substring(3).toLowerCase()
    cmd = alias[cmd] || cmd
  }

  if (commands[cmd]) {
    let moderator = isModerator(message.member.roles.array())
    commands[cmd]({ args, cache, client, message, moderator, serverId, userId })
  }
})

client.login(config.TOKEN)

client.on('ready', () => {
  console.log('I am ready!')
  energy.gainFromVoiceChannel({ client, cache, serverExist })
})

// * release memories
const interval = 60 * 1000 // 1 min
setInterval(() => {
  let nowTime = Date.now()
  for (let serverId in cache) {
    fs.writeFileSync(`./data/${serverId}.json`, JSON.stringify(cache[serverId]), { encoding: 'utf8' })
    serverExist[serverId] = 1

    if (nowTime - cache[serverId].last > 60 * interval) { // 1 hr
      delete cache[serverId]
    }
  }
}, 10 * interval)
