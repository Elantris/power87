const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config')
const client = new Discord.Client()

client.on('ready', () => {
  console.log('I am ready!')
})

// * get server list
let res = {}
let serverExits = {}
fs.readdirSync('./data/').forEach(v => {
  serverExits[v.split('.json')[0]] = 1
})

// * init commands
let commands = {}
const alias = require('./alias')
fs.readdirSync('./command/').filter(filename => filename.endsWith('.js')).forEach(filename => {
  let cmd = filename.split('.js')[0]
  commands[cmd] = require(`./command/${cmd}`)
})

// * main response
client.on('message', message => {
  if (message.author.bot || !message.content.startsWith('87')) {
    return
  }

  // restore data from save file
  if (!res[message.guild.id]) {
    if (serverExits[message.guild.id]) {
      res[message.guild.id] = require(`./data/${message.guild.id}`)
    } else {
      res[message.guild.id] = {}
    }
  }
  res[message.guild.id]._last = Date.now()

  // process command
  let args = message.content.replace(/  +/g, ' ').split(' ')
  if (args[0] === '87') {
    commands.res({ res, message, args })
  } else if (message.content[2] === '!') {
    let cmd = args[0].substring(3).toLowerCase()
    cmd = alias[cmd] || cmd
    if (commands[cmd]) {
      commands[cmd]({ client, res, message, args })
    }
  }
})

client.login(config.TOKEN)

// * release memories
const interval = 10 * 60 * 1000 // 1hr
setInterval(() => {
  let now = Date.now()
  for (let server in res) {
    if (now - res[server]._last > 6 * interval) {
      fs.writeFileSync(`./data/${server}.json`, JSON.stringify(res[server]), { encoding: 'utf8' })
      serverExits[server] = 1
      delete res[server]
    }
  }
}, interval)
