const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const equipmentSystem = require('../util/equipmentSystem')
const equipments = require('../util/equipments')
const sendResponseMessage = require('../util/sendResponseMessage')

const rarityCost = [0, 4, 8, 16, 32]
const rarityChances = [0, 0.81, 0.27, 0.09, 0.03]
const abilities = {
  str: '力量',
  vit: '體能',
  int: '智慧',
  agi: '敏捷',
  luk: '幸運'
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (!args[1]) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 0)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  args[1] = args[1].toLowerCase()

  let userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero.name) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_HERO' })
    return
  }
  if (userHero.status === 'dead') {
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_DEAD' })
    database.ref(`/hero/${guildId}/${userId}`).remove()
    return
  }

  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let description

  // enhance type
  if (args[1] === 'rarity') { // hero rarity
    if (userHero.rarity === 5) {
      sendResponseMessage({ message, errorCode: 'ERROR_MAX_RARITY' })
      return
    }

    if (!userInventory.items['40'] || userInventory.items['40'] < rarityCost[userHero.rarity]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_ENOUGH' })
      return
    }

    userInventory.items['40'] -= rarityCost[userHero.rarity]

    description = `:arrow_double_up: ${message.member.displayName} 消耗 :star:**英雄星數強化石**x${rarityCost[userHero.rarity]} 試圖強化英雄\n\n`

    let luck = Math.random()
    if (luck < rarityChances[userHero.rarity] * (1 + 0.01 * userHero.level)) {
      userHero.rarity += 1
      description += `強化成功！英雄稀有度提升一階，:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}`
    } else {
      description += '強化失敗，維持原狀，'
    }
  } else if (args[1] in abilities) { // hero ability
    let amount = parseInt(args[2] || 1)

    if (!userInventory.items['42'] || userInventory.items['42'] < amount) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_ENOUGH' })
      return
    }

    let total = 0
    for (let i in abilities) {
      total += userHero[i]
    }

    if (total + amount > userHero.level) {
      sendResponseMessage({ message, errorCode: 'ERROR_MAX_ABILITY' })
      return
    }

    userInventory.items['42'] -= amount
    userHero[args[1]] += amount

    description = `:arrow_double_up: ${message.member.displayName} 消耗 :sparkles:**英雄體質強化粉末**x${amount}\n\n` +
      `:${userHero.species}: **${userHero.name}** 的 **${abilities[args[1]]}** 提升 ${amount} 點，\`${args[1].toUpperCase()}\`: ${userHero[args[1]]}`
  } else { // hero equipment
    let target = {
      name: args[1].split('+')[0],
      level: parseInt(args[1].split('+')[1] || 0),
      id: -1,
      kind: '',
      quality: '',
      index: -1
    }

    if (!Number.isSafeInteger(target.level)) {
      sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
      return
    }

    let userEquipment = await equipmentSystem.read(database, guildId, userId)

    target.index = userEquipment.weapon.findIndex((weapon, index) => {
      if (target.name === equipments[weapon.id].name && target.level === weapon.level) {
        target.id = weapon.id
        target.kind = 'weapon'
        target.quality = equipments[weapon.id].quality || 'base'
        return true
      }
      return false
    })

    if (target.index === -1) {
      target.index = userEquipment.armor.findIndex((armor, index) => {
        if (target.name === equipments[armor.id].name && target.level === armor.level) {
          target.id = armor.id
          target.kind = 'armor'
          target.quality = equipments[armor.id].quality || 'base'
          return true
        }
        return false
      })
    }

    if (target.index === -1) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (!userInventory.items['46']) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_ENOUGH' })
      return
    }
    userInventory.items['46'] -= 1

    description = `:arrow_double_up: ${message.member.displayName} 消耗 :sparkles:**英雄裝備強化粉末**x1\n\n`

    let luck = Math.random()
    if (luck < equipmentSystem.enhanceChances[target.quality][target.level]) {
      userEquipment[target.kind][target.index].level += 1
      description += `強化成功，獲得了 ${equipments[target.id].icon}**${equipments[target.id].displayName}**+${userEquipment[target.kind][target.index].level}`

      equipmentSystem.write(database, guildId, userId, userEquipment)
    } else {
      description += `強化失敗，裝備維持原本的模樣`
    }
  }

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  // response
  sendResponseMessage({ message, description })
}
