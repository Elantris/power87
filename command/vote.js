module.exports = ({ message, args }) => {
  // check command foramt
  if (args.length < 2) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

  let duration = 60000 // 1 minute
  let multiply = 1

  // check custom duration number
  if (args[2] && Number.isSafeInteger(parseInt(args[2]))) {
    multiply = parseInt(args[2])
    if (multiply < 1 || multiply > 30) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: ':no_entry_sign: **時間錯誤**'
        }
      })
      return
    }
  }

  // add react for voting
  message.react('✅')
    .catch(console.error)
  setTimeout(() => {
    message.react('❌')
      .catch(console.error)
  }, 200)

  // result
  const filter = (reaction, user) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌'
  message.awaitReactions(filter, { time: duration * multiply })
    .then(collected => {
      let result = [0, 0]
      collected.array().forEach((v, i) => {
        result[i] = v.count - 1
      })

      let outcome = ''
      if (result[0] - result[1] > 0) {
        outcome = ':white_check_mark: 通過'
      } else if (result[0] - result[1] < 0) {
        outcome = ':x: 不通過'
      } else {
        outcome = '維持現狀'
      }

      message.channel.send({
        embed: {
          color: 0xffe066,
          title: `:scroll: 「${args[1]}」`,
          description: `\n<@${message.author.id}> 發起了 ${multiply} 分鐘的公投`,
          fields: [{
            name: '統計票數',
            value: `同意 ${result[0]} 票、不同意 ${result[1]} 票`
          }, {
            name: '最終結果',
            value: `__**${outcome}**__`
          }]
        }
      })
    })
    .catch(console.error)
}