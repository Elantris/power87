const fs = require('fs')

module.exports = ({ res, message, args }) => { // remove the response from the keyword
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    message.channel.send(':no_entry_sign: **格式錯誤**: `87!del` __關鍵字__ __項目編號__')
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
  if (Object.keys(res[message.guild.id][args[1]]).length === 0) {
    delete res[message.guild.id][args[1]] // delete the keyword whose response list is empty
  }
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })

  message.channel.send(`:fire: 移除了關鍵字 **${args[1]}** 的第 **${args[2]}** 個項目`)
}
