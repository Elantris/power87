const sendErrorMessage = require('../util/sendErrorMessage')

module.exports = ({ args, message }) => {
  // check command foramt
  if (args.length < 2) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let duration = 60000 // 1 minute
  let multiplier = 1

  // check custom duration number
  if (args[2] && Number.isSafeInteger(parseInt(args[2]))) {
    multiplier = parseInt(args[2])
    if (multiplier < 1 || multiplier > 30) {
      sendErrorMessage(message, 'ERROR_TIME')
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
  message.awaitReactions(filter, { time: duration * multiplier })
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
          description: `\n<@${message.author.id}> 發起了 ${multiplier} 分鐘的公投`,
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
