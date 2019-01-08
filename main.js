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

// * commands

function termNew (message, args) { // add keywords to list
  if (args.length < 3 || args[1].startsWith('_')) { // length 3
    message.channel.send(':no_entry_sign: **格式錯誤**: 87add `[關鍵字]` `[回應]`')
    return
  }

  if (!res[message.guild.id][args[1]]) { // init response list for certain keyword
    res[message.guild.id][args[1]] = {}
  }

  let key = 0
  Object.keys(res[message.guild.id][args[1]]).forEach(v => {
    if (parseInt(v) > key) {
      key = parseInt(v)
    }
  })
  key += 1 // get a position for new response
  res[message.guild.id][args[1]][key] = args.slice(2).join(' ')
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })

  message.channel.send(`:smiling_imp: 關鍵字 **${args[1]}** 新增了項目 **${key}**`)
}

function termDelete (message, args) { // remove the response from the keyword
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    message.channel.send(':no_entry_sign: **格式錯誤**: 87remove `[關鍵字]` `[項目編號]`')
    return
  }
  if (!res[message.guild.id][args[1]]) {
    message.channel.send(`:no_entry_sign: **查詢錯誤**: 沒有 ${args[1]} 這個關鍵字`)
    return
  }
  if (!res[message.guild.id][args[1]][parseInt(args[2])]) {
    message.channel.send(`:no_entry_sign: **查詢錯誤**: 關鍵字 **${args[1]}** 第 ${parseInt(args[2])} 位置沒有東西`)
    return
  }

  delete res[message.guild.id][args[1]][parseInt(args[2])]
  if (Object.keys(res[message.guild.id][args[1]]).length === 0) { // delete the keyword whose response list is empty
    delete res[message.guild.id][args[1]]
  }
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })

  message.channel.send(`:fire: 移除了關鍵字 **${args[1]}** 的第 **${args[2]}** 個項目`)
}

function termList (message, args) {
  if (args.length < 2) { // list all keywords from server
    let output = `:bookmark_tabs: 這個伺服器所有的關鍵字`
    output += '\n```'
    for (let i in res[message.guild.id]) {
      if (!i.startsWith('_')) {
        output += `\n${i}`
      }
    }
    output += '\n```'
    message.channel.send(output)
  } else { // list all responses of the keyword
    let output = `:bookmark_tabs: 關鍵字 **${args[1]}** 的回應列表`
    output += '\n```'
    for (let i in res[message.guild.id][args[1]]) {
      output += `\n${i}: ${res[message.guild.id][args[1]][i]}`
    }
    output += '\n```'
    message.channel.send(output)
  }
}

function termRes (message, args) {
  if (args.length === 1) {
    message.channel.send('__**87**__ **87** 87')
  } else {
    let resList = Object.keys(res[message.guild.id][args[1]])
    if (resList) {
      let choice = resList[Math.floor(Math.random() * resList.length)]
      if (args.length >= 3 && Number.isSafeInteger(parseInt(args[2])) && res[message.guild.id][args[1]][parseInt(args[2])]) {
        choice = parseInt(args[2])
      }
      message.channel.send(res[message.guild.id][args[1]][choice])
    }
  }
}

const commandList = {
  add: termNew,
  new: termNew,

  delete: termDelete,
  remove: termDelete,
  del: termDelete,
  rm: termDelete,

  list: termList,
  ls: termList,
  all: termList,

  '!': termRes
}

// * main response

client.on('message', message => {
  // * restore data from save file
  if (!res[message.guild.id]) {
    if (serverList[message.guild.id]) {
      res[message.guild.id] = require(`./data/${message.guild.id}`)
    } else {
      res[message.guild.id] = {}
    }
  }

  // * prefix: 87
  if (message.content.startsWith('87')) {
    res[message.guild.id]._last = Date.now()
    let args = message.content.split(' ')

    if (commandList[args[0].substring(2)]) {
      commandList[args[0].substring(2)](message, args)
    }
  }
})

client.login(config.TOKEN)

// * clear memory every 10 minutes
const interval = 10 * 60 * 1000
setInterval(() => {
  let now = Date.now()
  for (let server in res) {
    if (now - res[server]._last > interval) {
      fs.writeFileSync(`./data/${server}.json`, JSON.stringify(res[server]), { encoding: 'utf8' })
      serverList[server] = 1
      delete res[server]
    }
  }
}, interval)
