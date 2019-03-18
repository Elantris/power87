const commandCooldown = {
  add: 2,
  delete: 2,
  list: 10,

  energy: 5,
  rank: 30,
  daily: 30,
  give: 5,
  fish: 15,
  lottery: 10,
  slot: 15,

  help: 5,
  clean: 10,
  vote: 30,
  repo: 30,

  res: 2,
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
  let messageTime = message.createdTimestamp
  let cooldownTime = commandCooldown[userCmd] || 5000
  if (messageTime - commandLast[userId][userCmd] < cooldownTime) {
    return true
  }

  // update last command timestamp
  commandLast[userId][userCmd] = messageTime
  return false
}

module.exports = isCoolingDown
