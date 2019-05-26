const commandCooldown = {
  add: 2,
  delete: 2,
  list: 5,

  energy: 3,
  daily: 30,
  give: 3,
  rank: 30,
  slot: 15,
  roll: 15,

  inventory: 5,
  buy: 3,
  sell: 3,
  fishing: 5,
  use: 3,

  hero: 5,
  summon: 5,
  free: 5,
  rarityup: 5,
  changelooks: 10,
  feed: 3,

  help: 2,
  clean: 30,
  about: 30,
  hint: 2,

  res: 2,
  gainFromMessage: 120
}

for (let i in commandCooldown) {
  commandCooldown[i] *= 1000 // trasform to minisecond
}

let userLastUsed = {}

const isCoolingDown = ({ userCmd, message, userId }) => {
  // undefined detection
  userLastUsed[userId] = userLastUsed[userId] || {}
  userLastUsed[userId][userCmd] = userLastUsed[userId][userCmd] || 0

  // calculate cooldown time
  let cooldownTime = commandCooldown[userCmd] || 5000
  if (message.createdTimestamp - userLastUsed[userId][userCmd] < cooldownTime) {
    return true
  }

  // update last command timestamp
  userLastUsed[userId][userCmd] = message.createdTimestamp
  return false
}

module.exports = isCoolingDown
