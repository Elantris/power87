const sendResponseMessage = require('../util/sendResponseMessage')
let isCleaning = {}

module.exports = async ({ args, client, message, guildId }) => {
  if (isCleaning[guildId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_CLEANING' })
    return
  }

  isCleaning[guildId] = true

  let amount = 100

  if (args.length > 1 && Number.isSafeInteger(parseInt(args[1]))) {
    amount = parseInt(args[1])
    if (amount > 1000) {
      amount = 1000
    } else if (amount < 10) {
      amount = 10
    }
  }

  await message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:recycle: 讀取訊息中...`
    }
  })

  let messageCollections = []
  let before
  let countTotal = 0
  let countDeleted = 0

  while (countTotal < amount) {
    let limit = amount - countTotal
    if (limit > 100) {
      limit = 100
    }

    let messages = await message.channel.fetchMessages({ limit, before })

    if (messages.size === 0) {
      break
    }

    messages = messages.filter(m => m.deletable).filter(m => m.author.id === client.user.id || m.content.startsWith('87'))

    messageCollections.push(messages)
    countTotal += messages.size
    before = messages.last().id
  }

  let cleaningMessage = await message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:recycle: 清理訊息中... (${countTotal})`
    }
  })

  messageCollections.forEach(messages => {
    messages.tap(async m => {
      await m.delete()
      countDeleted++

      if (countDeleted === countTotal) {
        cleaningMessage.edit({
          embed: {
            color: 0xffe066,
            description: `:recycle: 成功刪除 ${countDeleted} 則訊息`
          }
        })
        delete isCleaning[guildId]
      }
    })
  })
}
