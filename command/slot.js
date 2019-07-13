const moment = require('moment')
const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')

const symbols = [':gem:', ':seven:', ':trophy:', ':moneybag:', ':gift:', ':ribbon:', ':balloon:', ':four_leaf_clover:', ':battery:', ':dollar:']
const prizes = [
  { chance: 0.0001, pattern: '000', multiplier: 100 },
  { chance: 0.0002, pattern: '111', multiplier: 77 },
  { chance: 0.0004, pattern: '222', multiplier: 50 },
  { chance: 0.0008, pattern: '333', multiplier: 30 },
  { chance: 0.0016, pattern: '444', multiplier: 20 },
  { chance: 0.0032, pattern: '555', multiplier: 15 },
  { chance: 0.0064, pattern: '666', multiplier: 10 },
  { chance: 0.0128, pattern: '777', multiplier: 5 },
  { chance: 0.0256, pattern: '888', multiplier: 3 },
  { chance: 0.0512, pattern: '999', multiplier: 1 },

  { chance: 0.0100, pattern: '00', multiplier: 50 },
  { chance: 0.0100, pattern: '11', multiplier: 38 },
  { chance: 0.0200, pattern: '22', multiplier: 25 },
  { chance: 0.0400, pattern: '33', multiplier: 15 },
  { chance: 0.0800, pattern: '44', multiplier: 10 },
  { chance: 0.1200, pattern: '55', multiplier: 7 },
  { chance: 0.1600, pattern: '66', multiplier: 5 },
  { chance: 0.2000, pattern: '77', multiplier: 2 },
  { chance: 0.2577, pattern: '88', multiplier: 1 }
]
const baseHitChance = 0.08
const lostMessages = [
  '結果是一無所獲',
  '然而什麼都沒有',
  '也許下次會更好',
  '再來一把一定行',
  '感覺到了，再來一次一定中',
  '這些能量都進了許願池',
  '難過的是放棄的夢被打碎',
  '呃啊啊啊啊啊',
  '獲得更多的印章'
]
const buffMapping = {
  '%1': {
    chance: 0.01,
    icon: ':candy:'
  },
  '%2': {
    chance: 0.02,
    icon: ':lollipop:'
  },
  '%3': {
    chance: 0.04,
    icon: ':chocolate_bar:'
  },
  '%4': {
    chance: 0.08,
    icon: ':popcorn:'
  }
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  let energyCost = 1
  let sayMessage = ''

  if (args[1]) {
    if (Number.isSafeInteger(parseInt(args[1]))) {
      energyCost = parseInt(args[1])
      if (energyCost < 1 || energyCost > 500) {
        return { errorCode: 'ERROR_ENERGY_EXCEED' }
      }
      sayMessage = args.slice(2)
    } else {
      sayMessage = args.slice(1)
    }

    if (sayMessage.length) {
      sayMessage = sayMessage.join(' ')
      if (sayMessage.length > 50) {
        return { errorCode: 'ERROR_LENGTH_EXCEED' }
      }
      sayMessage = `說完「${sayMessage}」之後`
    }
  }

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
  }
  if (userEnergy < energyCost) {
    return { errorCode: 'ERROR_NO_ENERGY' }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let buffInUse
  if (userInventory.buffs['%4']) {
    buffInUse = '%4'
  } else if (userInventory.buffs['%3']) {
    buffInUse = '%3'
  } else if (userInventory.buffs['%2']) {
    buffInUse = '%2'
  } else if (userInventory.buffs['%1']) {
    buffInUse = '%1'
  }

  // slot
  let slotResults = []
  let winId = -1
  let energyGain = 0
  let buffChance = 0
  let markChance = 0

  if (buffInUse) {
    buffChance = buffMapping[buffInUse].chance
  }
  if (userInventory.items['47']) {
    markChance = userInventory.items['47'] * 0.01
  }

  let luck = Math.random()
  if (luck < baseHitChance + buffChance + markChance) {
    luck = Math.random()
    prizes.some((prize, index) => {
      if (luck < prize.chance) {
        winId = index
        return true
      }
      luck -= prize.chance
      return false
    })
    if (winId === -1) {
      winId = prizes.length - 1
    }

    slotResults = prizes[winId].pattern.split('')
    energyGain = energyCost * prizes[winId].multiplier
  }

  while (slotResults.length !== 3) {
    const newSlot = Math.floor(Math.random() * 10).toString()
    if (!slotResults.includes(newSlot)) {
      slotResults.splice(Math.floor(Math.random() * 3), 0, newSlot)
    }
  }

  if (winId === -1) {
    if (!userInventory.items['47']) {
      userInventory.items['47'] = 0
    }
    if (energyCost === 500) {
      userInventory.items['47'] += 2
    } else if (energyCost >= 50) {
      userInventory.items['47'] += 1
    }
  } else {
    delete userInventory.items['47']
  }

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + energyGain - energyCost)
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  let content
  let description = `:slot_machine: 這是一台八七拉霸機\n\n` +
    `${message.member.displayName} ${sayMessage} 投注了 ${energyCost} 點八七能量\n` +
    `增益效果：`

  if (buffInUse) {
    let buffTime = moment.duration(userInventory.buffs[buffInUse] - message.createdTimestamp)
    description += `${buffMapping[buffInUse].icon} ${Math.floor(buffTime.asHours()).toString().padStart(2, '0')}:${buffTime.minutes().toString().padStart(2, '0')}`
  }

  description += `\n-------------------\n` +
    slotResults.map(v => symbols[v]).join(' : ') +
    `\n-------------------\n`

  if (winId === -1) {
    description += `| : : : : **LOST** : : : : |\n\n` +
      lostMessages[Math.floor(Math.random() * lostMessages.length)]

    if (userInventory.items['47']) {
      description += `\n\n目前累積 :broken_heart:**失落的印章-迷惘賭徒**x${userInventory.items['47']}`
    }
  } else if (winId === 0) {
    content = '@here 頭獎快訊！'
    description += `| : **CONGRATS** : |\n\n` +
      `<@${message.author.id}> 或成最大贏家，獲得了**頭獎** ${energyGain} 點八七能量`
  } else if (winId === 1) {
    content = '@here 777！'
    description += `| : : **77777777** : : |\n\n` +
      `<@${message.author.id}> 7 起來，獲得了 **777獎** ${energyGain} 點八七能量`
  } else {
    description += `| : : : : **WIN** : : : : : |\n\n` +
      `贏得了 ${energyGain} 點八七能量`
  }

  return { content, description }
}
