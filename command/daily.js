const moment = require('moment')

const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')

const dailyReward = 20
const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const monthlyReward = {
  month: '',
  days: 0,
  items: []
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  const now = moment(message.createdAt)
  const todayDisplay = now.format('YYYYMMDD')
  const yesterdayDisplay = now.subtract(1, 'd').format('YYYYMMDD')

  // update monthly rewards
  if (monthlyReward.month !== todayDisplay.substring(0, 6)) {
    monthlyReward.month = todayDisplay.substring(0, 6)

    const monthlyRewardRaw = await database.ref(`/monthlyReward/${todayDisplay.substring(0, 6)}`).once('value')
    if (monthlyRewardRaw.exists()) {
      monthlyReward.items = monthlyRewardRaw.val().split(',')
      monthlyReward.items.unshift('-')

      monthlyReward.days = monthDays[message.createdAt.getMonth()]
      if (monthlyReward.days === 28) { // Febularay
        const year = message.createdAt.getFullYear()
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
          monthlyReward.days = 29
        }
      }
    }
  }

  // user daily
  let dailyRaw = await database.ref(`/lastUsed/daily/${guildId}/${userId}`).once('value')
  if (dailyRaw.exists()) {
    dailyRaw = dailyRaw.val()
  } else {
    dailyRaw = ',0,0'
  }
  const dailyData = dailyRaw.split(',')

  if (dailyData[0] === todayDisplay) {
    return { description: `:calendar: ${message.member.displayName} 已經連續簽到 ${dailyData[1]} 天；本月累計簽到 ${dailyData[2] || 0} 天` }
  }

  if (dailyData[0] === yesterdayDisplay) {
    dailyData[1] = parseInt(dailyData[1]) + 1
  } else {
    dailyData[1] = 1
  }

  if (dailyData[0].substring(0, 6) === todayDisplay.substring(0, 6)) {
    dailyData[2] = parseInt(dailyData[2] || 0) + 1
  } else {
    dailyData[2] = 1
  }

  dailyData[0] = todayDisplay

  // energy system
  let userEnergy = await database.ref(`energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
  }
  userEnergy += dailyReward

  let bonusEnergy = ''
  if (dailyData[1] % 30 === 0) {
    userEnergy += 500
    bonusEnergy += '，獲得額外 500 點能量'
  } else if (dailyData[1] % 5 === 0) {
    userEnergy += 50
    bonusEnergy += '，獲得額外 50 點能量'
  }

  // inventory system
  let rewardMessage = ''
  if (monthlyReward.items[dailyData[2]] && monthlyReward.items[dailyData[2]] !== '-') {
    const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
    const reward = monthlyReward.items[dailyData[2]].split('.')
    if (!userInventory.items[reward[0]]) {
      userInventory.items[reward[0]] = 0
    }
    userInventory.items[reward[0]] += parseInt(reward[1] || 1)
    inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

    rewardMessage = `，獲得 ${items[reward[0]].icon}**${items[reward[0]].displayName}**x${reward[1] || 1}`
  }

  // update databse
  database.ref(`/lastUsed/daily/${guildId}/${userId}`).set(dailyData.join(','))
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)

  // response
  let description = `:calendar: ${message.member.displayName} 完成每日簽到獲得 ${dailyReward} 點八七能量。連續簽到 ${dailyData[1]} 天${bonusEnergy}；本月累計簽到 ${dailyData[2]} 天${rewardMessage}\n\n本月簽到獎勵列表：\n`

  for (let i = 1; i <= monthlyReward.days; i++) {
    if (i % 7 === 1) {
      description += '\n'
    } else {
      description += ' '
    }

    if (i <= dailyData[2]) {
      description += ':sunny:'
    } else if (monthlyReward.items[i] && monthlyReward.items[i] !== '-') {
      description += items[monthlyReward.items[i].split('.')[0]].icon
    } else {
      description += ':white_small_square:'
    }
  }

  return { description }
}
