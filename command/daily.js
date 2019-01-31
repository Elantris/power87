const moment = require('moment')

module.exports = ({ database, energies, message, serverId, userId }) => {
  let nowTime = moment().format('YYYYMMDDHH')

  if (!energies[userId].lastDaily) {
    energies[userId].lastDaily = ''
  }

  if (energies[userId].lastDaily === nowTime) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: 冷卻期間`
      }
    })
    return
  }

  energies[userId].amount += 10
  energies[userId].lastDaily = nowTime

  database.ref(`/energies/${serverId}`).update(energies)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:battery: <@${userId}> 獲得 10 點八七能量`
    }
  })
}
