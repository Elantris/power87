const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')

module.exports = ({ args, database, energies, message, guildId, userId }) => {
  if (args.length !== 3 || !message.mentions.users.array()[0] || !Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let targetId = message.mentions.users.array()[0].id
  let energyGain = parseInt(args[2])
  let energyCost = Math.ceil(energyGain * 1.3)

  if (energies[userId].a < energyCost) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  if (!energies[targetId]) {
    energy.inition({ energies, userId: targetId })
  }

  energies[userId].a -= energyCost
  energies[targetId].a += energyGain
  database.ref(`/energies/${guildId}/${userId}`).update(energies[userId])
  database.ref(`/energies/${guildId}/${targetId}`).update(energies[targetId])

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:money_mouth: <@${userId}> 消耗了 ${energyCost} 點八七能量，<@${targetId}> 獲得了 ${energyGain} 點八七能量`
    }
  })
}
