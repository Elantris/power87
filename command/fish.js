const sendErrorMessage = require('../sendErrorMessage')

const prizes = [500, 300, 100, 50, 30, 10, 5, 3, 1, 0]
const level = [2, 6, 16, 44, 128, 370, 1071, 3105, 9005, 10000]
const items = {
  500: ['gem'],
  300: ['whale', 'whale2'],
  100: ['shark'],
  50: ['dolphin'],
  30: ['penguin'],
  10: ['turtle'],
  5: ['blowfish'],
  3: ['tropical_fish'],
  1: ['fish'],
  0: ['baby_bottle', 'closed_umbrella', 'eyeglasses', 'gear', 'mans_shoe', 'paperclip', 'paperclips', 'sandal', 'shopping_cart', 'spoon', 'unlock', 'wastebasket', 'wrench']
}
const cooldownTime = 15000

module.exports = ({ args, database, energies, message, serverId, userId }) => {
  // check cooldown time
  let cmdTime = message.createdAt.getTime()
  if (!energies[userId].lF) {
    energies[userId].lF = 0 // last fish
  }
  if (cmdTime - energies[userId].lF < cooldownTime) {
    if (!energies[userId]._ban) {
      energies[userId]._ban = 0
    }
    energies[userId]._ban++
    database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])
    return
  }
  energies[userId].lF = cmdTime

  // check energy
  let energyCost = 2
  if (energies[userId].a < energyCost) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  // main function
  let luck = Math.random() * 10000
  let multiplier = 0
  for (let i in prizes) {
    if (luck < level[i]) {
      multiplier = prizes[i]
      break
    }
  }
  energies[userId].a += multiplier - energyCost
  database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])

  let item = Math.floor(Math.random() * items[multiplier].length)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:fishing_pole_and_fish: ${message.member.displayName} 釣到了 :${items[multiplier][item]}:！獲得了 ${multiplier} 點八七能量`
    }
  })
}
