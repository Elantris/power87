const moment = require('moment')
const energy = require('../util/energy')
const sendResponseMessage = require('../util/sendResponseMessage')
const hints = require('../util/hints')

module.exports = ({ database, message, guildId, userId }) => {
  let todayDisplay = moment().format('YYYYMMDD')
  let yesterdayDisplay = moment().subtract(1, 'd').format('YYYYMMDD')

  database.ref(`/lastUsed/daily/${guildId}/${userId}`).once('value').then(snapshot => {
    let dailyRaw = snapshot.val()
    if (!snapshot.exists()) {
      dailyRaw = ',1'
    }
    let dailyData = dailyRaw.split(',')

    if (dailyData[0] === todayDisplay) {
      sendResponseMessage({ message, description: `:calendar: ${message.member.displayName} 連續簽到 ${dailyData[1]} 天\n\n${hints()}` })
      return
    }

    if (dailyData[0] === yesterdayDisplay) {
      dailyData[1] = parseInt(dailyData[1]) + 1
    } else {
      dailyData[1] = 1
    }
    dailyData[0] = todayDisplay

    database.ref(`energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energy.INITIAL_USER_ENERGY
      }
      userEnergy += 20

      let bonusMessage = ''
      if (dailyData[1] > 1) {
        bonusMessage = `，連續簽到達 ${dailyData[1]} 天`
        if (dailyData[1] % 30 === 0) {
          userEnergy += 500
          bonusMessage += `，獲得額外 500 點能量！`
        } else if (dailyData[1] % 5 === 0) {
          userEnergy += 50
          bonusMessage += `，獲得額外 50 點能量！`
        }
      }

      database.ref(`/lastUsed/daily/${guildId}/${userId}`).set(dailyData.join(','))
      database.ref(`energy/${guildId}/${userId}`).set(userEnergy)

      sendResponseMessage({ message, description: `:calendar: ${message.member.displayName} 完成每日簽到獲得 20 點八七能量${bonusMessage}\n\n${hints()}` })
    })
  })
}
