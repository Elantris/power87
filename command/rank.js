const updateInterval = 10 * 60 * 1000 // 10 min

function response ({ message, rankData }) {
  let output = `:trophy: 八七能量排行榜\n`
  for (let i in rankData) {
    let tmp = rankData[i].split(':')
    if (tmp[1]) {
      output += `\n${i}. <@${tmp[0]}>: ${tmp[1]}`
    }
  }

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: output
    }
  })
}

module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`/lastUsed/rank/${guildId}`).once('value').then(snapshot => {
    let rank = snapshot.val()
    if (!snapshot.exists()) {
      rank = '0'
    }
    let rankData = rank.split(',')
    if (message.createdTimestamp - rankData[0] < updateInterval) {
      // cache output
      response({ message, rankData })
    } else {
      // udpate rank data
      database.ref(`/energy/${guildId}`).once('value').then(snapshot => {
        let guildEnergy = snapshot.val() || { _keep: 1 }

        // sort guild energy
        let tmpRank = []
        for (let userId in guildEnergy) {
          if (userId.startsWith('_')) {
            continue
          }
          tmpRank.push({
            userId,
            amount: guildEnergy[userId]
          })
        }
        tmpRank = tmpRank.sort((a, b) => b.amount - a.amount).slice(0, 5)
        rank = `${message.createdTimestamp},${tmpRank.map(data => `${data.userId}:${data.amount}`).join(',')}`
        database.ref(`/lastUsed/rank/${guildId}`).set(rank)

        rankData = rank.split(',')
        response({ message, rankData })
      })
    }
  })
}
