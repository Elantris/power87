module.exports = ({ res, message, args }) => {
  // check command format
  if (args.length > 1 && !res[message.guild.id][args[1]]) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: **查詢錯誤**`
      }
    })
    return
  }

  let target = res[message.guild.id]
  let output = ':bookmark_tabs: '

  if (args.length === 1) {
    // list all keywords from server
    output += `所有關鍵字 (${Object.keys(res[message.guild.id]).length - 1}/50)\n`
    for (let i in target) {
      if (i.startsWith('_')) {
        continue
      }
      output += `\n${i}`
    }
  } else {
    // list all responses of the keyword
    output += `**${args[1]}** 的回應列表\n`
    target = res[message.guild.id][args[1]]
    for (let i in target) {
      output += `\n${i.toString().padStart(2)}. ${target[i]}`
    }
  }
  output += '\n'

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: output
    }
  })
}
