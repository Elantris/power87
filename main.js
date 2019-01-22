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
const commands = {
  add: require('./command/cmdAdd'),
  clean: require('./command/cmdClean'),
  del: require('./command/cmdDel'),
  help: require('./command/cmdHelp'),
  list: require('./command/cmdList'),
  vote: require('./command/cmdVote'),
  res: require('./command/cmdRes')
}
const alias = require('./alias')

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

  let args = message.content.replace(/  +/g, ' ').split(' ')
  if (args[0] === '87') {
    commands.res({ res, message, args })
  } else if (message.content[2] === '!') {
    let cmd = args[0].substring(3).toLowerCase()
    if (alias[cmd]) {
      cmd = alias[cmd]
    }
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
