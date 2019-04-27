const energySystem = require('../util/energySystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const diceIconMapping = {
  1: ':one:',
  2: ':two:',
  3: ':three:',
  4: ':four:',
  5: ':five:',
  6: ':six:'
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
    diceDisplay: dice.map(v => diceIconMapping[v]).join(' '),
    score
  }
}

module.exports = ({ args, database, message, guildId, userId }) => {
  let bet = 1
  let sayMessage = ''

  // parse parameters
  if (args.length > 1) {
    if (Number.isSafeInteger(parseInt(args[1]))) {
      bet = parseInt(args[1])
      if (bet < 1 || bet > 500) {
        sendResponseMessage({ message, errorCode: 'ERROR_ENERGY_EXCEED' })
        return
      }
      sayMessage = args.slice(2)
    } else {
      sayMessage = args.slice(1)
    }

    if (sayMessage.length) {
      sayMessage = sayMessage.join(' ')
      if (sayMessage.length > 50) {
        sendResponseMessage({ message, errorCode: 'ERROR_LENGTH_EXCEED' })
        return
      }
      sayMessage = `大喊「${sayMessage}」之後`
    }
  }

  // energy system
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = energySystem.INITIAL_USER_ENERGY
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
    }
    if (userEnergy < bet) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
      return
    }

    // game
    let gameDisplay = '莊家擲出了 '
    let energyGain = 0
    let host = rollDice()
    if (host.score === 'same') {
      gameDisplay += `**一色！**\n${host.diceDisplay}`
      energyGain = bet * -1
    } else if (host.score === 12) {
      gameDisplay += `**豹子！**\n${host.diceDisplay}`
      energyGain = bet * -1
    } else if (host.score === 3) {
      gameDisplay += `**最小的 3 點！**\n${host.diceDisplay}`
      energyGain = bet
    } else {
      gameDisplay += `**${host.score} 點**\n${host.diceDisplay}\n\n${message.member.displayName} ${sayMessage}擲出了 `

      let player = rollDice()
      if (player.score === 'same') {
        gameDisplay += `**一色！**`
        energyGain = bet * 2
      } else if (player.score === 12) {
        gameDisplay += `**豹子！**`
        energyGain = bet * 2
      } else if (player.score === 3) {
        gameDisplay += `**最小的 3 點！**`
        energyGain = bet * -2
      } else {
        gameDisplay += `**${player.score} 點**`

        if (player.score > host.score) {
          energyGain = bet
        } else {
          energyGain = bet * -1
        }
      }
      gameDisplay += `\n${player.diceDisplay}`
    }

    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + energyGain)

    let resultDisplay = ``
    if (energyGain > 0) {
      resultDisplay = `${message.member.displayName} 贏得了 ${energyGain} 點八七能量`
    } else if (energyGain < 0) {
      resultDisplay = `${message.member.displayName} 失去了 ${energyGain * -1} 點八七能量`
    }

    sendResponseMessage({ message, description: `:game_die: 碗公裡發出了清脆的聲響\n\n${gameDisplay}\n\n${resultDisplay}` })
  })
}
