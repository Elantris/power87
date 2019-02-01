const energy = require('../energy')

module.exports = ({ args, database, energies, message, serverId, userId }) => {
  if (args.length !== 3 || !message.mentions.users.array()[0] || !Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 2) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

  let targetUser = message.mentions.users.array()[0].id
  let exchange = parseInt(args[2])

  if (energies[userId].a < exchange) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **八七能量不足**'
      }
    })
    return
  }

  let gainEnergy = Math.floor(exchange * 0.7)

  if (!energies[targetUser]) {
    energy.inition({ energies, userId: targetUser })
  }
  energies[targetUser].a += gainEnergy
  energies[userId].a -= exchange
  database.ref(`/energies/${serverId}`).update(energies)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:money_mouth: <@${userId}> 消耗了 ${exchange} 點八七能量，<@${targetUser}> 獲得了 ${gainEnergy} 點八七能量`
    }
  })
}
