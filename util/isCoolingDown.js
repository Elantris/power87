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
  repo: 1,

  res: 1,
  gainFromMessage: 120
}

for (let i in commandCooldown) {
  commandCooldown[i] *= 1000 // trasform to minisecond
}

let commandLast = {}

const isCoolingDown = ({ userCmd, message, serverId, userId }) => {
  // undefined detection
  commandLast[userId] = commandLast[userId] || {}
  commandLast[userId][userCmd] = commandLast[userId][userCmd] || 0

  // calculate cooldown time
  let messageTime = message.createdAt.getTime()
  let cooldownTime = commandCooldown[userCmd] || 1000
  if (messageTime - commandLast[userId][userCmd] < cooldownTime) {
    return true
  }

  // update last command timestamp
  commandLast[userId][userCmd] = messageTime
  return false
}

module.exports = isCoolingDown
