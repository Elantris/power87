const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')

const symbols = {
  1: ':one:',
  2: ':two:',
  3: ':three:',
  4: ':four:',
  5: ':five:',
  6: ':six:'
}
const resultMapping = {
  same: '一色',
  12: '豹子',
  3: '最小點'
}

const rollDice = () => {
  let dice = []
  let score = 0

  while (!score) {
    dice = []
    for (let i = 0; i < 4; i++) {
      dice.push(Math.floor(Math.random() * 6) + 1)
    }
    dice.sort()

    if (dice[0] === dice[1] && dice[1] === dice[2] && dice[2] === dice[3]) {
      score = 'same'
    } else if (dice[0] === dice[1]) {
      score = dice[2] + dice[3]
    } else if (dice[1] === dice[2]) {
      score = dice[0] + dice[3]
    } else if (dice[2] === dice[3]) {
      score += dice[0] + dice[1]
    }
  }

  return {
    dice,
    display: dice.map(v => symbols[v]).join(' '),
    score
  }
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  let bet = 1
  let sayMessage = ''

  // parse parameters
  if (args.length > 1) {
    if (Number.isSafeInteger(parseInt(args[1]))) {
      bet = parseInt(args[1])
      if (bet < 1 || bet > 500) {
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
      sayMessage = `大喊「${sayMessage}」之後`
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

  if (userEnergy < bet * 2) {
    return { errorCode: 'ERROR_NO_ENERGY' }
  }

  // inventory system
  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let certainWinChance = 0
  if (userInventory.buffs['%4']) {
    certainWinChance = 0.04
  } else if (userInventory.buffs['%3']) {
    certainWinChance = 0.03
  } else if (userInventory.buffs['%2']) {
    certainWinChance = 0.02
  } else if (userInventory.buffs['%1']) {
    certainWinChance = 0.01
  }

  if (userInventory.items['47']) {
    certainWinChance += userInventory.items['47'] * 0.01
  }

  // roll
  let host = rollDice()
  let player = rollDice()

  const luck = Math.random()
  if (luck < certainWinChance) {
    while (resultMapping[host.score]) {
      host = rollDice()
    }
    while (player.score !== 'same' && player.score !== 12) {
      player = rollDice()
    }
  }

  let energyChange = 0
  if (host.score === 12 || host.score === 'same') {
    energyChange = bet * -1
  } else if (host.score === 3) {
    energyChange = bet
  } else if (player.score === 12 || player.score === 'same') {
    energyChange = bet * 2
  } else if (player.score === 3) {
    energyChange = bet * -2
  } else if (player.score > host.score) {
    energyChange = bet
  } else {
    energyChange = bet * -1
  }

  if (energyChange > 0) {
    delete userInventory.items['47']
  } else {
    if (!userInventory.items['47']) {
      userInventory.items['47'] = 0
    }
    if (bet >= 50) {
      userInventory.items['47'] += 1
      if (resultMapping[player.score]) {
        userInventory.items['47'] += 1
      }
    }
    if (bet === 500) {
      userInventory.items['47'] += 1
    }
  }

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + energyChange)
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  let description = `:game_die: 碗公裡發出了清脆的聲響\n\n`

  if (resultMapping[host.score]) {
    description += `Power87 擲出了 **${resultMapping[host.score]}**！\n\n${host.display}\n\n`
  } else {
    description += `Power87 擲出了 **${host.score} 點**\n\n${host.display}\n\n`

    if (resultMapping[player.score]) {
      description += `${message.member.displayName} 擲出了 **${resultMapping[player.score]}**！\n\n${player.display}\n\n`
    } else {
      description += `${message.member.displayName} 擲出了 **${player.score} 點**\n\n${player.display}\n\n`
    }
  }

  if (energyChange > 0) {
    description += `${message.member.displayName} 贏得了 ${energyChange} 點八七能量`
  } else {
    description += `${message.member.displayName} 失去了 ${Math.abs(energyChange)} 點八七能量`
  }

  if (userInventory.items['47']) {
    description += `\n目前累積 :broken_heart:**失落的印章-迷惘賭徒**x${userInventory.items['47']}`
  }

  return { description }
}
