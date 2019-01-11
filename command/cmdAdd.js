const fs = require('fs')

module.exports = ({ res, message, args }) => { // add keywords to list
  if (args.length < 3 || args[1].startsWith('_')) { // length 3
    message.channel.send(':no_entry_sign: **格式錯誤**: `87!add` __關鍵字__ __回應__')
    return
  }

  if (!res[message.guild.id][args[1]]) { // init response list for certain keyword
    res[message.guild.id][args[1]] = {}
  }

  let key = 1
  for (key; key <= 10; key++) {
    if (!res[message.guild.id][args[1]][key]) {
      break
    }
  }
  if (key === 11) {
    message.channel.send(':no_entry_sign: **項目過多**: 先刪除掉一些項目騰出更多空間')
    return
  }

  res[message.guild.id][args[1]][key] = args.slice(2).join(' ')
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })

  message.channel.send(`:white_check_mark: 關鍵字 **${args[1]}** 新增了項目 **${key}**`)
}
