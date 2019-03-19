const updateInterval = 10 * 60 * 1000 // 10 min

module.exports = ({ database, energies, message, guildId, userId }) => {
  if (!energies._rank) {
    energies._rank = {
      _last: 0
    }
  }

  let cmdTime = message.createdTimestamp
  if (cmdTime - energies._rank._last > updateInterval) {
    energies._rank._last = cmdTime
    let tmpRank = []
    for (let userId in energies) {
      if (userId.startsWith('_')) {
        continue
      }
      tmpRank.push({
        userId,
        a: energies[userId].a
      })
    }
    tmpRank = tmpRank.sort((a, b) => b.a - a.a).slice(0, 5)
    for (let i in tmpRank) {
      energies._rank[Math.floor(i) + 1] = tmpRank[i]
    }
    database.ref(`/energies/${guildId}/_rank`).update(energies._rank)
  }

  let output = `:battery: 八七能量排行榜\n`

  for (let i in energies._rank) {
    if (i.startsWith('_')) {
      continue
    }
    output += `\n${i}. <@${energies._rank[i].userId}>: ${energies._rank[i].a}`
  }

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: output
    }
  })
}
