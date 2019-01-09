module.exports = ({ res, message, args }) => {
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
  } else if (!res[message.guild.id][args[1]]) {
    message.channel.send(`:no_entry_sign: **查詢錯誤**: 沒有 ${args[1]} 這個關鍵字`)
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