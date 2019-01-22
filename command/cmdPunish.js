const fs = require('fs')
const isModerator = require('../isModerator')

module.exports = ({ res, message, args }) => {
  if (!isModerator({ message })) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **權限不足**'
      }
    })
    return
  }

  if (args.length === 1 || !message.mentions.users.array()[0]) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

  const targetId = message.mentions.users.array()[0].id
  let times = 1

  if (args[2]) {
    if (!Number.isSafeInteger(parseInt(args[2]))) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: ':no_entry_sign: **次數錯誤**'
        }
      })
      return
    }

    times = parseInt(args[2])
    if (times < 1) {
      times = 1
    } else if (times > 5) {
      times = 5
    }
  }

  if (!res[message.guild.id]._punishments) {
    res[message.guild.id]._punishments = {}
  }

  res[message.guild.id]._punishments[targetId] = times
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })
  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:zipper_mouth: <@${message.author.id}> 要 <@${targetId}> 閉嘴`
    }
  })
}
