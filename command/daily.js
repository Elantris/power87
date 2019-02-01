const moment = require('moment')

module.exports = ({ database, energies, message, serverId, userId }) => {
  let nowTime = moment().format('YYYYMMDD')

  if (!energies[userId].lD) {
    energies[userId].lD = '' // last Daily
  }

  if (energies[userId].lD === nowTime) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: 冷卻期間`
      }
    })
    return
  }

  energies[userId].a += 10
  energies[userId].lD = nowTime

  database.ref(`/energies/${serverId}`).update(energies)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:battery: ${message.member.displayName}獲得 10 點八七能量`
    }
  })
}
