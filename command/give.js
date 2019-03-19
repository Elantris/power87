const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')

module.exports = ({ args, database, energies, message, guildId, userId }) => {
  if (args.length !== 3 || !message.mentions.users.array()[0] || !Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 2) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let targetId = message.mentions.users.array()[0].id
  let exchange = parseInt(args[2])

  if (energies[userId].a < exchange) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  let gainEnergy = Math.floor(exchange * 0.7)

  if (!energies[targetId]) {
    energy.inition({ energies, userId: targetId })
  }
  energies[userId].a -= exchange
  energies[targetId].a += gainEnergy
  database.ref(`/energies/${guildId}/${userId}`).update(energies[userId])
  database.ref(`/energies/${guildId}/${targetId}`).update(energies[targetId])

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:money_mouth: <@${userId}> 消耗了 ${exchange} 點八七能量，<@${targetId}> 獲得了 ${gainEnergy} 點八七能量`
    }
  })
}
