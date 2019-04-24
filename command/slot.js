const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const icons = [
  { prize: 100, symbol: ':gem:', weight: 5 },
  { prize: 77, symbol: ':seven:', weight: 7 },
  { prize: 50, symbol: ':trophy:', weight: 11 },
  { prize: 30, symbol: ':moneybag:', weight: 13 },
  { prize: 20, symbol: ':gift:', weight: 17 },
  { prize: 15, symbol: ':ribbon:', weight: 19 },
  { prize: 10, symbol: ':balloon:', weight: 23 },
  { prize: 5, symbol: ':four_leaf_clover:', weight: 25 },
  { prize: 3, symbol: ':battery:', weight: 40 },
  { prize: 1, symbol: ':dollar:', weight: 60 },
  { prize: 0, symbol: ':wrench:', weight: 5 },
  { prize: 0, symbol: ':gear:', weight: 5 },
  { prize: 0, symbol: ':bomb:', weight: 5 },
  { prize: 0, symbol: ':paperclip:', weight: 5 },
  { prize: 0, symbol: ':wastebasket:', weight: 5 }
]
const totalWeight = 245

module.exports = ({ args, database, message, guildId, userId }) => {
  let energyCost = 1
  let sayMessage = ''

  // parse parameters
  if (args.length > 1) {
    if (Number.isSafeInteger(parseInt(args[1]))) {
      energyCost = parseInt(args[1])
      if (energyCost < 1 || energyCost > 500) {
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
      sayMessage = `說完「${sayMessage}」之後`
    }
  }

  // energy system
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = energySystem.INITIAL_USER_ENERGY
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
    }
    if (userEnergy < energyCost) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
      return
    }

    // check buffs
    database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
      let inventoryRaw = snapshot.val()
      if (!snapshot.exists()) {
        inventoryRaw = ''
        database.ref(`/inventory/${guildId}/${userId}`).set('')
      }
      let userInventory = inventorySystem.parse(inventoryRaw, message.createdTimestamp)

      let weightMinus = 0
      if (userInventory.buffs['%4']) {
        weightMinus = 25
      } else if (userInventory.buffs['%3']) {
        weightMinus = 15
      } else if (userInventory.buffs['%2']) {
        weightMinus = 10
      } else if (userInventory.buffs['%1']) {
        weightMinus = 5
      }

      // slot results
      let result = []
      for (let i = 0; i < 3; i++) {
        let luck = Math.random() * (totalWeight - weightMinus)
        for (let j in icons) {
          if (luck < icons[j].weight) {
            result.push(j)
            break
          }
          luck -= icons[j].weight
        }
      }

      let resultDisplay = `-------------------\n${result.map(n => icons[n].symbol).join(' : ')}\n-------------------\n`
      result.sort()

      // energy system
      let multiplier = 0
      if (result[0] === result[1] && result[1] === result[2]) {
        multiplier = icons[result[0]].prize
      } else if (result[1] < 8 && (result[0] === result[1] || result[1] === result[2])) {
        multiplier = Math.floor(icons[result[1]].prize / 2)
      }

      let energyGain = energyCost * multiplier

      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + energyGain - energyCost)

      // response
      let content
      let resultMessage = ''
      if (multiplier === 0) {
        resultDisplay += `| : : : : **LOST** : : : : |`
        resultMessage = '結果是一無所獲'
      } else if (multiplier < icons[1].prize) {
        resultDisplay += `| : : : : **WIN** : : : : : |`
        resultMessage = `獲得了 ${energyGain} 點八七能量`
      } else if (multiplier === icons[1].prize) {
        content = '@here 777！'
        resultDisplay += `| : : **77777777** : : |`
        resultMessage = `<@${message.author.id}> 7 起來，獲得了 ${energyGain} 點八七能量`
      } else if (multiplier === icons[0].prize) {
        content = '@here 頭獎快訊！'
        resultDisplay += `| : **CONGRATS** : |`
        resultMessage = `<@${message.author.id}> 或成最大贏家，獲得了 ${energyGain} 點八七能量`
      }

      sendResponseMessage({ message, content, description: `:tickets: 這是一台八七拉霸機\n${resultDisplay}\n\n${message.member.displayName} ${sayMessage}投注了 ${energyCost} 點八七能量，${resultMessage}` })
    })
  })
}
