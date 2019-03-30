const commandCooldown = {
  add: 2,
  delete: 2,
  list: 15,

  energy: 5,
  daily: 30,
  give: 5,
  rank: 30,
  slot: 15,

  inventory: 15,
  buy: 5,
  sell: 5,
  fishing: 15,

  help: 5,
  clean: 15,
  about: 15,

  res: 2,
  gainFromMessage: 120
}

for (let i in commandCooldown) {
  commandCooldown[i] *= 1000 // trasform to minisecond
}

let lastUsed = {}

const isCoolingDown = ({ userCmd, message, userId }) => {
  // undefined detection
  lastUsed[userId] = lastUsed[userId] || {}
  lastUsed[userId][userCmd] = lastUsed[userId][userCmd] || 0

  // calculate cooldown time
  let cooldownTime = commandCooldown[userCmd] || 5000
  if (message.createdTimestamp - lastUsed[userId][userCmd] < cooldownTime) {
    return true
  }

  // update last command timestamp
  lastUsed[userId][userCmd] = message.createdTimestamp
  return false
}

module.exports = isCoolingDown
