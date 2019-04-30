const moment = require('moment')

const energySystem = require('../util/energySystem')
const hints = require('../util/hints')
const sendResponseMessage = require('../util/sendResponseMessage')

const diarySystem = ({ database, message, guildId, yesterdayDisplay, todayDisplay }) => {
  database.ref(`/lastUsed/diary/${guildId}`).once('value').then(snapshot => {
    let diaryRaw = snapshot.val() || ''
    if (diaryRaw === todayDisplay) {
      return
    }
    database.ref(`/lastUsed/diary/${guildId}`).set(todayDisplay)

    database.ref(`/diary/_start`).once('value').then(snapshot => {
      let start = snapshot.val()
      if (!snapshot.exists()) {
        return
      }
      let offset = moment(todayDisplay).diff(moment(start), 'days')

      database.ref(`/diary/${offset}`).once('value').then(snapshot => {
        if (!snapshot.exists()) {
          return
        }
        let diaryContent = snapshot.val()

        database.ref(`/lastUsed/daily/${guildId}`).once('value').then(snapshot => {
          let guildDaily = snapshot.val() || {}
          let yesterdayDaily = 0
          for (let userId in guildDaily) {
            if (guildDaily[userId].split(',')[0] === yesterdayDisplay) {
              yesterdayDaily++
            }
          }

          message.channel.send({
            embed: {
              title: `開發者日記 ${todayDisplay}`,
              description: diaryContent,
              color: 0xffc078,
              fields: [{
                name: '昨日簽到人數',
                value: yesterdayDaily,
                inline: true
              }, {
                name: '伺服器總人數',
                value: message.guild.memberCount,
                inline: true
              }]
            }
          })
        })
      })
    })
  })
}

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
    database.ref(`energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
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
      diarySystem({ database, message, guildId, yesterdayDisplay, todayDisplay })
    })
  })
}
