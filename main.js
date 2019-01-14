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
const cmdClean = require('./command/cmdClean')
const cmdDel = require('./command/cmdDel')
const cmdHelp = require('./command/cmdHelp')
const cmdList = require('./command/cmdList')
const cmdVote = require('./command/cmdVote')
const cmdRes = require('./command/cmdRes')

const commandList = {
  add: cmdAdd,
  clean: cmdClean,
  del: cmdDel,
  help: cmdHelp,
  list: cmdList,
  vote: cmdVote
}

const alias = {
  new: 'add',
  a: 'add',
  n: 'add',

  delete: 'del',
  remove: 'del',
  rm: 'del',
  d: 'del',
  r: 'del',

  ls: 'list',
  l: 'list',
  all: 'list',

  clear: 'clean',
  prune: 'clean',
  c: 'clean',

  v: 'vote',

  h: 'help',
  manual: 'help'
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
    let args = message.content.replace(/  +/g, ' ').split(' ')

    if (args[0] === '87') {
      cmdRes({ res, message, args })
    } else if (message.content[2] === '!') {
      let cmd = args[0].substring(3).toLowerCase()
      if (alias[cmd]) {
        cmd = alias[cmd]
      }
      if (commandList[cmd]) {
        commandList[cmd]({ client, res, message, args })
      }
    }
  }
})

client.login(config.TOKEN)

// * release memories
const interval = 10 * 60 * 1000
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
