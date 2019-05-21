const moment = require('moment')

const energySystem = require('../util/energySystem')
const hints = require('../util/hints')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ database, message, guildId, userId }) => {
  let todayDisplay = moment().format('YYYYMMDD')
  let yesterdayDisplay = moment().subtract(1, 'd').format('YYYYMMDD')

  let dailyRaw = await database.ref(`/lastUsed/daily/${guildId}/${userId}`).once('value')
  if (dailyRaw.exists()) {
    dailyRaw = dailyRaw.val()
  } else {
    dailyRaw = ',1'
  }
  let dailyData = dailyRaw.split(',')

  if (dailyData[0] === todayDisplay) {
    sendResponseMessage({ message, description: `:calendar: ${message.member.displayName} 已經累計連續簽到 ${dailyData[1]} 天\n\n${hints()}` })
    return
  }

  if (dailyData[0] === yesterdayDisplay) {
    dailyData[1] = parseInt(dailyData[1]) + 1
  } else {
    dailyData[1] = 1
  }
  dailyData[0] = todayDisplay

  // energy system
  let userEnergy = await database.ref(`energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
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

  // update databse
  database.ref(`/lastUsed/daily/${guildId}/${userId}`).set(dailyData.join(','))
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)

  // response
  sendResponseMessage({ message, description: `:calendar: ${message.member.displayName} 完成每日簽到獲得 20 點八七能量${bonusMessage}\n\n${hints()}` })

  // diary
  // diarySystem({ database, message, guildId, yesterdayDisplay, todayDisplay })
}
