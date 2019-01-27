const fs = require('fs')
const isModerator = require('../isModerator')

module.exports = ({ res, message, args }) => { // remove the response from the keyword
  // check roles of user
  if (!isModerator(message.member.roles.array())) {
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

  let serverId = message.guild.id
  let term = args[1]
  let key = parseInt(args[2])

  // check term and response exists
  if (!res[serverId][term] || !res[serverId][term][key]) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: **查詢錯誤**`
      }
    })
    return
  }

  // delete response
  delete res[serverId][term][key]
  if (Object.keys(res[serverId][term]).length === 0) {
    delete res[message.guild.id][term] // delete the keyword whose response list is empty
  }
  fs.writeFileSync(`./data/${serverId}.json`, JSON.stringify(res[serverId]), { encoding: 'utf8' })

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:fire: 移除了 **${term}** 的第 **${key}** 個項目`
    }
  })
}
