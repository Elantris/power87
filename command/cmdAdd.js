const fs = require('fs')

module.exports = ({ res, message, args }) => { // add keywords to list
  if (args.length < 3 || args[1].startsWith('_')) { // length 3
    message.channel.send(':no_entry_sign: **格式錯誤**: 87!add `[關鍵字]` `[回應]`')
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
  key += 1 // find an available key for new response

  res[message.guild.id][args[1]][key] = args.slice(2).join(' ')
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })

  message.channel.send(`:white_check_mark: 關鍵字 **${args[1]}** 新增了項目 **${key}**`)
}
