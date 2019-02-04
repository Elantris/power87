const commandCooldown = {
  add: 1,
  delete: 1,
  list: 5,

  energy: 5,
  rank: 5,
  daily: 5,
  give: 1,
  fish: 15,
  lottery: 1,

  help: 1,
  clean: 10,
  vote: 5,

  res: 1,
  gainFromMessage: 120
}

for (let i in commandCooldown) {
  commandCooldown[i] *= 1000 // trasform to minisecond
}

let commandRecord = {}

const isCoolingDown = ({ userCmd, message, serverId, userId }) => {
  let messageTime = message.createdAt.getTime()
  if (!commandRecord[userId]) {
    commandRecord[userId] = {}
  }

  if (!commandRecord[userId][userCmd]) {
    commandRecord[userId][userCmd] = 0
  }

  if (messageTime - commandRecord[userId][userCmd] < commandCooldown[userCmd]) {
    return true
  }

  commandRecord[userId][userCmd] = messageTime
  return false
}

module.exports = isCoolingDown
