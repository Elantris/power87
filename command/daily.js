const moment = require('moment')

module.exports = ({ message, cache, serverId, userId }) => {
  let nowTime = moment().format('YYYYMMDDHH')

  if (!cache[serverId].energies[userId].lastDaily) {
    cache[serverId].energies[userId].lastDaily = ''
  }

  if (cache[serverId].energies[userId].lastDaily === nowTime) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: `:no_entry_sign: 冷卻期間`
      }
    })
    return
  }

  cache[serverId].energies[userId].amount += 10
  cache[serverId].energies[userId].lastDaily = nowTime

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:battery: <@${userId}> 獲得 10 點八七能量`
    }
  })
}
