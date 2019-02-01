module.exports = ({ energies, message, serverId, userId }) => {
  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:battery: ${message.member.displayName} 擁有 ${energies[userId].amount} 點八七能量`
    }
  })
}
