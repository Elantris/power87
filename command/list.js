module.exports = ({ args, cache, message, serverId }) => {
  // check command format
  if (args.length > 1 && !cache[serverId].responses[args[1]]) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: **查詢錯誤**`
      }
    })
    return
  }

  let target = cache[serverId].responses
  let output = ':bookmark_tabs: '

  if (args.length === 1) {
    // list all keywords from server
    output += `所有關鍵字 [${Object.keys(target).length - 1}/50]\n`
    for (let i in target) {
      if (i.startsWith('_')) {
        continue
      }
      output += `\n${i} (${Object.keys(target[i]).length})`
    }
  } else {
    // list all responses of the keyword
    target = cache[serverId].responses[args[1]]
    output += `**${args[1]}** 的回應列表 [${Object.keys(target).length}/20]\n`
    for (let i in target) {
      output += `\n${i}. ${target[i]}`
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
