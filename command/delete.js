const fs = require('fs')
const isModerator = require('../isModerator')

module.exports = ({ message, args, cache, serverId, userId }) => { // remove the response from the keyword
  // check user energy
  if (!isModerator(message.member.roles.array()) && cache[serverId].energies[userId].amount < 20) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **八七能量不足**'
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

  let term = args[1]
  let position = parseInt(args[2])

  // check term and response exists
  if (!cache[serverId].responses[term] || !Number.isSafeInteger(position) || !cache[serverId].responses[term][position]) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: **查詢錯誤**`
      }
    })
    return
  }

  // delete response
  delete cache[serverId].responses[term][position]
  if (Object.keys(cache[serverId].responses[term]).length === 0) {
    delete cache[serverId].responses[term] // delete the keyword whose response list is empty
  }
  fs.writeFileSync(`./data/${serverId}.json`, JSON.stringify(cache[serverId]), { encoding: 'utf8' })
  cache[serverId].energies[userId].amount -= 20

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:fire: 移除了 **${term}** 的第 **${position}** 個項目`
    }
  })
}
