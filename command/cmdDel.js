const fs = require('fs')
const isModerator = require('../isModerator')

module.exports = ({ res, message, args }) => { // remove the response from the keyword
  // check roles of user
  if (!isModerator({ message })) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **權限不足**'
      }
    })
    return
  }

  // check command format
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

  // check term and response exists
  if (!res[message.guild.id][args[1]] || !res[message.guild.id][args[1]][parseInt(args[2])]) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: **查詢錯誤**`
      }
    })
    return
  }

  // delete response
  delete res[message.guild.id][args[1]][parseInt(args[2])]
  if (Object.keys(res[message.guild.id][args[1]]).length === 0) {
    delete res[message.guild.id][args[1]] // delete the keyword whose response list is empty
  }
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:fire: 移除了 **${args[1]}** 的第 **${args[2]}** 個項目`
    }
  })
}
