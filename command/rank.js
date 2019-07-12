const updateInterval = 10 * 60 * 1000 // 10 min

function makeOutput ({ message, rank }) {
  let rankDisplay = `:trophy: 八七能量排行榜\n`
  for (let i in rank) {
    if (i !== '0') {
      let tmp = rank[i].split(':')
      rankDisplay += `\n${i}. <@${tmp[0]}>: ${tmp[1]}`
    }
  }

  return rankDisplay
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  let rank = await database.ref(`/lastUsed/rank/${guildId}`).once('value')
  if (rank.exists()) {
    rank = rank.val()
  } else {
    rank = [0]
  }

  if (message.createdTimestamp - rank[0] < updateInterval) { // cache output
    return { description: makeOutput({ message, rank }) }
  }

  let guildEnergy = await database.ref(`/energy/${guildId}`).once('value')
  guildEnergy = guildEnergy.val() || {}

  // sort guild energy
  let tmpRank = []
  for (let userId in guildEnergy) {
    tmpRank.push({
      userId,
      amount: guildEnergy[userId]
    })
  }
  tmpRank = tmpRank.sort((a, b) => b.amount - a.amount).slice(0, 5)
  rank = tmpRank.map(data => `${data.userId}:${data.amount}`)
  rank.unshift(message.createdTimestamp)

  database.ref(`/lastUsed/rank/${guildId}`).set(rank)

  return { description: makeOutput({ message, rank }) }
}
