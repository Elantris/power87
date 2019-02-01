const cooldownTime = 60 * 60 * 1000 // 1hr

module.exports = ({ database, energies, message, serverId, userId }) => {
  if (!energies._rank) {
    energies._rank = {
      _last: 0
    }
  }

  let nowTime = Date.now()
  if (nowTime - energies._rank._last > cooldownTime) {
    energies._rank._last = nowTime
    let tmpRank = []
    for (let userId in energies) {
      if (userId.startsWith('_')) {
        continue
      }
      tmpRank.push({
        userId,
        amount: energies[userId].amount
      })
    }
    tmpRank = tmpRank.sort((a, b) => b.amount - a.amount).slice(0, 5)
    for (let i in tmpRank) {
      energies._rank[Math.floor(i) + 1] = tmpRank[i]
    }
    database.ref(`/energies/${serverId}`).update(energies)
  }

  let output = `:battery: 八七能量排行榜\n`

  for (let i in energies._rank) {
    if (i.startsWith('_')) {
      continue
    }
    output += `\n${i}. <@${energies._rank[i].userId}>: ${energies._rank[i].amount}`
  }

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: output
    }
  })
}
