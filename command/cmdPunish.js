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

  if (args.length === 1) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

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

  const targetId = args[1].substring(3, args[1].length - 1)
  res[message.guild.id]._punishments[targetId] = Date.now() + duration * 60000
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })
  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:zipper_mouth: 禁止 ${args[1]} 使用指令 ${duration} 分鐘`
    }
  })
}
