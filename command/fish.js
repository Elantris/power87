const prizes = [100, 50, 30, 25, 20, 10, 5, 3, 1, 0]
const level = [ 1, 3, 8, 23, 70, 215, 666, 2064, 6397, 10000 ]
const items = {
  100: ['gem'],
  50: ['whale', 'whale2'],
  30: ['shark'],
  25: ['dolphin'],
  20: ['penguin'],
  10: ['turtle'],
  5: ['blowfish'],
  3: ['tropical_fish'],
  1: ['fish'],
  0: ['baby_bottle', 'closed_umbrella', 'eyeglasses', 'gear', 'mans_shoe', 'paperclip', 'paperclips', 'sandal', 'shopping_cart', 'spoon', 'unlock', 'wastebasket', 'wrench']
}
const cooldownTime = 15000

module.exports = ({ args, database, energies, message, serverId, userId }) => {
  // check cooldown time
  let nowTime = Date.now()
  if (!energies[userId].lF) {
    energies[userId].lF = 0
  }

  if (nowTime - energies[userId].lF < cooldownTime) {
    if (!energies[userId]._ban) {
      energies[userId]._ban = 0
    }
    energies[userId]._ban++
    energies[userId].lF = nowTime + cooldownTime
    database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])
    return
  }
  energies[userId].lF = nowTime

  let energyCost = 1
  if (args[1] && Number.isSafeInteger(parseInt(args[1]))) {
    energyCost = parseInt(args[1])
    if (energyCost < 1 || energyCost > 10) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: ':no_entry_sign: **超出範圍**'
        }
      })
      return
    }
  }

  if (energies[userId].a < energyCost) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **八七能量不足**'
      }
    })
    return
  }

  let luck = Math.random() * 10000
  let multiplier = 0
  for (let i in prizes) {
    if (luck < level[i]) {
      multiplier = prizes[i]
      break
    }
  }
  energies[userId].a += energyCost * (multiplier - 1)
  database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])

  let item = Math.floor(Math.random() * items[multiplier].length)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:fishing_pole_and_fish: ${message.member.displayName} 釣到了 :${items[multiplier][item]}:！總共獲得了 ${energyCost * multiplier} 點八七能量`
    }
  })
}
