const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config')
const client = new Discord.Client()

client.on('ready', () => {
  console.log('I am ready!')
})

// * get server list
let serverExist = {}
fs.readdirSync('./data/').forEach(v => {
  serverExist[v.split('.json')[0]] = 1
})

// * init commands
let commands = {}
const alias = require('./alias')
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`./command/${cmd}`)
})

// * main response
let cache = {}
client.on('message', message => {
  if (message.author.bot || !message.content.startsWith('87')) {
    return
  }

  let serverId = message.guild.id

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
    commands[cmd]({ client, message, args, cache, serverId })
  }
})

client.login(config.TOKEN)

// * release memories
const interval = 60 * 1000 // 1 min
setInterval(() => {
  let now = Date.now()
  for (let serverId in cache) {
    if (now - cache[serverId].last > 60 * interval) { // 1 hr
      fs.writeFileSync(`./data/${serverId}.json`, JSON.stringify(cache[serverId]), { encoding: 'utf8' })
      serverExist[serverId] = 1
      delete cache[serverId]
    }
  }
}, interval)
