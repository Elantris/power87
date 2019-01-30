module.exports = ({ message, cache, serverId, userId }) => {
  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:battery: <@${userId}> 擁有 ${cache[serverId].energies[userId].amount} 點 87 能量`
    }
  })
}
