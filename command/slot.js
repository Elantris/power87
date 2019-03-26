const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')

const items = [{ prize: 100, symbol: ':gem:', weight: 5 }, { prize: 77, symbol: ':seven:', weight: 7 }, { prize: 50, symbol: ':trophy:', weight: 11 }, { prize: 30, symbol: ':moneybag:', weight: 13 }, { prize: 20, symbol: ':gift:', weight: 17 }, { prize: 15, symbol: ':ribbon:', weight: 19 }, { prize: 10, symbol: ':balloon:', weight: 23 }, { prize: 5, symbol: ':four_leaf_clover:', weight: 25 }, { prize: 3, symbol: ':battery:', weight: 50 }, { prize: 1, symbol: ':dollar:', weight: 50 }, { prize: 0, symbol: ':wrench:', weight: 1 }, { prize: 0, symbol: ':gear:', weight: 1 }, { prize: 0, symbol: ':bomb:', weight: 1 }, { prize: 0, symbol: ':paperclip:', weight: 1 }, { prize: 0, symbol: ':wastebasket:', weight: 1 }]
const totalWeight = 225

module.exports = ({ args, database, message, guildId, userId }) => {
  let energyCost = 1
  let announcement = []
  let announcementDisplay = ''

  // parse parameters
  if (args.length > 1) {
    if (Number.isSafeInteger(parseInt(args[1]))) {
      energyCost = parseInt(args[1])
      if (energyCost < 1 || energyCost > 500) {
        sendErrorMessage(message, 'ERROR_ENERGY_EXCEED')
        return
      }
      announcement = args.slice(2)
    } else {
      announcement = args.slice(1)
    }

    if (announcement.length) {
      let tmp = announcement.join(' ')
      if (tmp.length > 50) {
        sendErrorMessage(message, 'ERROR_LENGTH_EXCEED')
        return
      }
      announcementDisplay = `說完「**${tmp}**」之後`
    }
  }

  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = energy.INITIAL_USER_ENERGY
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
    }
    if (userEnergy < energyCost) {
      sendErrorMessage(message, 'ERROR_NO_ENERGY')
      return
    }

    // main function
    let result = []
    for (let i = 0; i < 3; i++) {
      let luck = Math.random() * totalWeight
      for (let j in items) {
        if (luck < items[j].weight) {
          result.push(j)
          break
        }
        luck -= items[j].weight
      }
    }

    let resultDisplay = `-------------------\n${result.map(n => items[n].symbol).join(' : ')}\n-------------------\n`
    result.sort()

    let multiplier = 0
    if (result[0] === result[1] && result[1] === result[2]) {
      multiplier = items[result[0]].prize
    } else if (result[1] < 8 && (result[0] === result[1] || result[1] === result[2])) {
      multiplier = Math.floor(items[result[1]].prize / 2)
    }

    let energyGain = energyCost * multiplier
    userEnergy += energyGain - energyCost

    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)

    // response
    let resultDescription = ''
    if (multiplier === 0) {
      resultDisplay += `| : : : : **LOST** : : : : |`
      resultDescription = '結果是一無所獲'
    } else if (multiplier < items[1].prize) {
      resultDisplay += `| : : : : **WIN** : : : : : |`
      resultDescription = `獲得了 ${energyGain} 點八七能量`
    } else if (multiplier === items[1].prize) {
      resultDisplay += `| : : **77777777** : : |`
      resultDescription = `@here 777！<@${message.author.id}> 7 起來，獲得了 ${energyGain} 點八七能量`
    } else if (multiplier === items[0].prize) {
      resultDisplay += `| : **CONGRATS** : |`
      resultDescription = `@here 頭獎快訊！<@${message.author.id}> 或成最大贏家，獲得了 ${energyGain} 點八七能量`
    }

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:tickets: 這是一台八七拉霸機\n${resultDisplay}\n\n${message.member.displayName} ${announcementDisplay}投注了 ${energyCost} 點八七能量，${resultDescription}`
      }
    })
  })
}
