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
  let duration = 1
  let argTime = parseInt(args[2])

  if (args[2] && Number.isSafeInteger(argTime)) {
    if (argTime < 1) {
      argTime = 1
    } else if (argTime > 30) {
      argTime = 30
    }
    duration *= argTime
  }

  if (!res[message.guild.id]._punishments) {
    res[message.guild.id]._punishments = {}
  }

  res[message.guild.id]._punishments[targetId] = Date.now() + duration * 60000
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })
  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:zipper_mouth: 禁止 <@${targetId}> 使用指令 ${duration} 分鐘`
    }
  })
}
