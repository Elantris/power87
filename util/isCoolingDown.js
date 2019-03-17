const commandCooldown = {
  add: 3,
  delete: 3,
  list: 10,

  energy: 10,
  rank: 30,
  daily: 30,
  give: 3,
  fish: 15,
  lottery: 10,

  help: 3,
  clean: 10,
  vote: 30,
  repo: 3,

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
  let cooldownTime = commandCooldown[userCmd] || 5000
  if (messageTime - commandLast[userId][userCmd] < cooldownTime) {
    return true
  }

  // update last command timestamp
  commandLast[userId][userCmd] = messageTime
  return false
}

module.exports = isCoolingDown
