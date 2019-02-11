const sendErrorMessage = require('../util/sendErrorMessage')

const prizes = [100, 50, 30, 20, 10, 5, 3, 2.4, 1.1, 0.4]
const poolEnergyCost = {
  0: 1,
  1: 10,
  2: 100
}
const items = {
  0: ['gem'],
  1: ['whale', 'whale2'],
  2: ['shark'],
  3: ['dolphin'],
  4: ['penguin'],
  5: ['turtle'],
  6: ['blowfish'],
  7: ['tropical_fish'],
  8: ['fish'],
  9: ['baby_bottle', 'closed_umbrella', 'eyeglasses', 'gear', 'mans_shoe', 'paperclip', 'paperclips', 'sandal', 'shopping_cart', 'spoon', 'unlock', 'wastebasket', 'wrench']
}
const chances = {
  0: [5, 14, 35, 71, 143, 572, 1144, 2288, 4290, 10000],
  1: [4, 11, 27, 55, 110, 440, 880, 1760, 3300, 10000],
  2: [4, 10, 25, 50, 100, 400, 800, 1600, 3000, 10000]
}

module.exports = ({ args, database, energies, message, serverId, userId }) => {
  // check command foramt
  let selectedPool = args[1] || 0
  if (args.length < 1 || args.length > 2 || !poolEnergyCost[selectedPool]) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  // check energy
  let energyCost = poolEnergyCost[selectedPool]
  if (energies[userId].a < energyCost) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  // main function
  let luck = Math.random() * 10000
  let award = 0
  for (let i in prizes) {
    if (luck < chances[selectedPool][i]) {
      award = i
      break
    }
  }

  let energyGain = Math.floor(energyCost * prizes[award])
  energies[userId].a += energyGain - energyCost
  database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])

  let item = Math.floor(Math.random() * items[award].length)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:fishing_pole_and_fish: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，釣到了 :${items[award][item]}:！獲得了 ${energyGain} 點八七能量`
    }
  })
}
