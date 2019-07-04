let isCleaning = {}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (isCleaning[guildId]) {
    return { errorCode: 'ERROR_IS_CLEANING' }
  }

  isCleaning[guildId] = true

  let targetAmount = 100

  if (args[1] && Number.isSafeInteger(parseInt(args[1]))) {
    targetAmount = parseInt(args[1])
    if (targetAmount > 1000) {
      targetAmount = 1000
    } else if (targetAmount < 2) {
      targetAmount = 2
    }
  }

  // read messages
  await message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:recycle: 讀取訊息中...`
    }
  })

  let messageCollections = []
  let before
  let fetchAmount = 0

  while (fetchAmount < targetAmount) {
    let limit = targetAmount - fetchAmount
    if (limit > 100) {
      limit = 100
    }

    let messages = await message.channel.fetchMessages({ limit, before })
    messages = messages.filter(m => m.deletable).filter(m => m.author.id === client.user.id || m.content.startsWith('87'))
    if (messages.size === 0) {
      break
    }
    messageCollections.push(messages)
    before = messages.last().id
    fetchAmount += messages.size
  }

  // delete messages
  let cleaningMessage = await message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:recycle: 清理 ${fetchAmount} 則訊息中...`
    }
  })

  messageCollections.forEach(async messages => {
    await message.channel.bulkDelete(messages, true)
  })

  await cleaningMessage.edit({
    embed: {
      color: 0xffe066,
      description: `:recycle: 已清除 ${fetchAmount} 則訊息`
    }
  })
  setTimeout(() => {
    cleaningMessage.delete()
    delete isCleaning[guildId]
  }, 5000)
}
