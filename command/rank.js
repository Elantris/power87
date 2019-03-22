const updateInterval = 10 * 60 * 1000 // 10 min

function response ({ message, rank }) {
  let output = `:trophy: 八七能量排行榜\n`
  for (let i in rank) {
    if (i !== '0') {
      let tmp = rank[i].split(':')
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
      rank = [0]
    }
    if (message.createdTimestamp - rank[0] < updateInterval) {
      // cache output
      response({ message, rank })
    } else {
      // udpate rank data
      database.ref(`/energy/${guildId}`).once('value').then(snapshot => {
        let guildEnergy = snapshot.val() || {}

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

        response({ message, rank })
      })
    }
  })
}
