const moment = require('moment')
const sendErrorMessage = require('../util//sendErrorMessage')

module.exports = ({ database, energies, message, serverId, userId }) => {
  let nowTime = moment().format('YYYYMMDD')

  if (!energies[userId].lD) {
    energies[userId].lD = '' // last Daily
  }

  if (energies[userId].lD === nowTime) {
    sendErrorMessage(message, 'ERROR_ALREADY_DAILY')
    return
  }

  energies[userId].a += 10
  energies[userId].lD = nowTime

  database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:battery: ${message.member.displayName} 獲得 10 點八七能量`
    }
  })
}
