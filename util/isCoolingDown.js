const cooldownTime = {
  add: 3,
  delete: 3,
  list: 15,

  energy: 3,
  daily: 15,
  give: 3,
  rank: 30,
  slot: 15,
  roll: 15,

  inventory: 5,
  buy: 3,
  sell: 3,
  fishing: 10,
  use: 3,
  mark: 10,

  hero: 5,
  free: 5,
  feed: 3,
  enhance: 5,
  refine: 5,

  help: 3,
  wiki: 3,
  hint: 3,
  clean: 15,
  about: 15,

  res: 3,
  gainFromMessage: 120
}

for (let i in cooldownTime) {
  cooldownTime[i] *= 1000 // trasform to minisecond
}

let userLastUsed = {}

module.exports = ({ userCmd, message, userId }) => {
  // undefined detection
  if (!userLastUsed[userId]) {
    userLastUsed[userId] = {}
  }
  if (!userLastUsed[userId][userCmd]) {
    userLastUsed[userId][userCmd] = 0
  }

  // calculate cooldown time
  if (message.createdTimestamp - userLastUsed[userId][userCmd] < (cooldownTime[userCmd] || 5000)) {
    return true
  }

  // update last command timestamp
  userLastUsed[userId][userCmd] = message.createdTimestamp
  return false
}
