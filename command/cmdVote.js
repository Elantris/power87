module.exports = ({ message, args }) => {
  if (args.length < 2) {
    message.channel.send(':no_entry_sign: **格式錯誤**: `87!vote` __公投主題__ [公投時間]')
    return
  }

  let duration = 60000 // 1 minute

  if (args[2] && Number.isSafeInteger(parseInt(args[2]))) {
    let tmp = parseInt(args[2])
    if (tmp < 1 || tmp > 30) {
      message.channel.send(':no_entry_sign: 發起公投的允許投票時間為 1 ~ 30 分鐘')
      return
    }
    duration *= tmp
  }

  message.react('✅')
    .catch(console.error)
  setTimeout(() => {
    message.react('❌')
      .catch(console.error)
  }, 200)

  const filter = (reaction, user) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌'
  message.awaitReactions(filter, { time: duration })
    .then(collected => {
      let result = [0, 0]
      collected.array().forEach((v, i) => {
        result[i] = v.count - 1
      })

      let output = ''
      if (result[0] - result[1] > 0) {
        output = '通過'
      } else if (result[0] - result[1] < 0) {
        output = '不通過'
      } else {
        output = '維持現狀'
      }

      message.channel.send(`<@${message.author.id}> 發起了公投\n「**${args[1]}**」\n:white_check_mark: 同意 ${result[0]}、:x: 不同意 ${result[1]}\n\n最終結果：__**${output}**__`)
    })
    .catch(console.error)
}
