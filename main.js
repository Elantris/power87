const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config')
const client = new Discord.Client()

client.on('ready', () => {
  console.log('I am ready!')
})

// * get server list
let res = {}
let serverList = {}
fs.readdirSync('./data/').forEach(v => {
  serverList[v.split('.json')[0]] = 1
})

// * init commands
const cmdAdd = require('./command/cmdAdd')
const cmdDel = require('./command/cmdDel')
const cmdList = require('./command/cmdList')
const cmdClean = require('./command/cmdClean')
const cmdRes = require('./command/cmdRes')

const commandList = {
  add: cmdAdd,
  new: cmdAdd,

  delete: cmdDel,
  remove: cmdDel,
  del: cmdDel,
  rm: cmdDel,

  list: cmdList,
  ls: cmdList,
  all: cmdList,

  clean: cmdClean,
  clear: cmdClean,
  prune: cmdClean,

  '!': cmdRes
}

// * main response
client.on('message', message => {
  // restore data from save file
  if (!res[message.guild.id]) {
    if (serverList[message.guild.id]) {
      res[message.guild.id] = require(`./data/${message.guild.id}`)
    } else {
      res[message.guild.id] = {}
    }
  }

  // prefix is 87
  if (message.content.startsWith('87')) {
    res[message.guild.id]._last = Date.now()
    let args = message.content.split(' ')

    if (commandList[args[0].substring(2)]) {
      commandList[args[0].substring(2)]({ client, res, message, args })
    }
  }
})

client.login(config.TOKEN)

// * release memories every 1 hour
const interval = 60 * 60 * 1000
setInterval(() => {
  let now = Date.now()
  for (let server in res) {
    if (now - res[server]._last > 6 * interval) {
      fs.writeFileSync(`./data/${server}.json`, JSON.stringify(res[server]), { encoding: 'utf8' })
      serverList[server] = 1
      delete res[server]
    }
  }
}, interval)
