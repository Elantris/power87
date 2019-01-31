const prizes = [100, 50, 30, 25, 20, 10, 5, 3, 1, 0]
const level = [13, 26, 52, 104, 208, 416, 832, 1664, 3328, 10000]
const items = {
  100: [':gem:'],
  50: [':whale:'],
  30: [':whale2:'],
  25: [':shark:'],
  20: [':dolphin:'],
  10: [':turtle:'],
  5: [':blowfish:'],
  3: [':tropical_fish:'],
  1: [':fish:'],
  0: [':wrench:', ':gear:', ':paperclip:', ':paperclips:', ':shopping_cart:', ':unlock:', ':mans_shoe:', ':sandal:', ':closed_umbrella:', ':eyeglasses:']
}
const cooldownTime = 10000

module.exports = ({ args, database, energies, message, serverId, userId }) => {
  // check cooldown time
  let nowTime = Date.now()
  if (!energies[userId].lastFish) {
    energies[userId].lastFish = 0
  }

  if (nowTime - energies[userId].lastFish < cooldownTime) {
    return
  }
  energies[userId].lastFish = nowTime

  let energyCost = 1
  if (args[1] && Number.isSafeInteger(parseInt(args[1]))) {
    energyCost = parseInt(args[1])
    if (energyCost < 1 || energyCost > 100) {
      energyCost = 1
    }
  }

  if (energies[userId].amount < energyCost) {
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
  energies[userId].amount += energyCost * (multiplier - 1)
  database.ref(`/energies/${serverId}`).update(energies)

  let item = Math.floor(Math.random() * items[multiplier].length)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:fishing_pole_and_fish: ${message.member.nickname} 釣到了 **${items[multiplier][item]}**！總共獲得了 ${energyCost * multiplier} 點八七能量`
    }
  })
}
