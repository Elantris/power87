const sendErrorMessage = require('../util/sendErrorMessage')

const items = [{
  prize: 100,
  symbol: ':gem:',
  weight: 5
}, {
  prize: 77,
  symbol: ':seven:',
  weight: 7
}, {
  prize: 50,
  symbol: ':trophy:',
  weight: 11
}, {
  prize: 30,
  symbol: ':moneybag:',
  weight: 13
}, {
  prize: 20,
  symbol: ':gift:',
  weight: 17
}, {
  prize: 15,
  symbol: ':ribbon:',
  weight: 19
}, {
  prize: 10,
  symbol: ':balloon:',
  weight: 23
}, {
  prize: 5,
  symbol: ':four_leaf_clover:',
  weight: 25
}, {
  prize: 3,
  symbol: ':battery:',
  weight: 50
}, {
  prize: 1,
  symbol: ':dollar:',
  weight: 50
}, {
  prize: 0,
  symbol: ':wrench:',
  weight: 5
}, {
  prize: 0,
  symbol: ':gear:',
  weight: 5
}, {
  prize: 0,
  symbol: ':bomb:',
  weight: 5
}, {
  prize: 0,
  symbol: ':pill:',
  weight: 5
}]

const totalWeight = 240

// 87!slot
// 87!slot 12
// 87!slot RRRR
// 87!slot __amount__ [others]

module.exports = ({ args, database, energies, message, serverId, userId }) => {
  let energyCost = 1
  let announcement = []

  if (args.length > 1) {
    announcement = args.slice(1)
    if (Number.isSafeInteger(parseInt(args[1]))) {
      energyCost = parseInt(args[1])
      if (energyCost < 1 || energyCost > 500) {
        energyCost = 1
      } else {
        announcement = args.slice(2)
      }
    }
  }

  if (energies[userId].a < energyCost) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  let result = []
  for (let i = 0; i < 3; i++) {
    let luck = Math.random() * totalWeight
    for (let j in items) {
      if (luck < items[j].weight) {
        result.push(j)
        break
      } else {
        luck -= items[j].weight
      }
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
  energies[userId].a += energyGain - energyCost
  database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])

  // response
  let announcementMessage = ''
  if (announcement.length) {
    announcementMessage = `說完「**${announcement.join(' ')}**」之後`
  }

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
      description: `:tickets: 這是一台充滿八七能量的拉霸機\n\n${resultDisplay}\n\n${message.member.displayName} ${announcementMessage}投注了 ${energyCost} 點八七能量，${resultDescription}`
    }
  })
}
