const energyCost = 5

module.exports = ({ cache, message, moderator, serverId, userId }) => {
  // check user energy
  if (!moderator && cache[serverId].energies[userId].amount < energyCost) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **八七能量不足**'
      }
    })
    return
  }

  if (!moderator) {
    cache[serverId].energies[userId].amount -= energyCost
  }

  let output = `:battery: 八七能量排行榜\n\n`
  let rank = []
  for (let userId in cache[serverId].energies) {
    rank.push({
      userId,
      amount: cache[serverId].energies[userId].amount
    })
  }
  rank.sort((a, b) => b.amount - a.amount)
  output += rank.slice(0, 5).map((user, index) => `${index + 1}. <@${user.userId}>: ${user.amount}`).join('\n')

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: output
    }
  })
}
