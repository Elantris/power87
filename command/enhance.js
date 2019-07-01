const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const equipments = require('../util/equipments')
const sendResponseMessage = require('../util/sendResponseMessage')

const rarityCost = [0, 4, 8, 16, 32]
const rarityChances = [0, 0.81, 0.27, 0.09, 0.03]
const abilities = {
  str: '力量',
  vit: '體能',
  agi: '敏捷',
  int: '智慧',
  luk: '幸運'
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  if (args[1]) {
    args[1] = args[1].toLowerCase()
  }

  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 0)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

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

  let description

  // enhance type
  if (args.length === 1) {
    description = `:arrow_double_up: ${message.member.displayName} 可以強化的項目：`

    if (userHero.rarity < 5) {
      description += `\n\n:star:**英雄星數強化石**x${userInventory.items['40'] || 0}\n` +
        `**英雄稀有度**：消耗 :star:x${rarityCost[userHero.rarity]}，**${Math.floor(rarityChances[userHero.rarity] * 100)}%**，\`87!enhance rarity\``
    }

    let total = 0
    for (let i in abilities) {
      total += userHero[i]
    }
    if (total < userHero.level) {
      description += `\n\n:sparkles:**英雄體質強化粉末**x${userInventory.items['42'] || 0}`
      for (let i in abilities) {
        description += `\n**${abilities[i]}**：消耗 :sparkles:x1，\`87!enhance ${i} 1\``
      }
    }

    let tmpEquipments = userInventory.equipments.filter(v => v.level < inventorySystem.enhanceChances[equipments[v.id].quality].length)
    if (tmpEquipments.length) {
      description += `\n\n:sparkles:**英雄裝備強化粉末**x${userInventory.items['46'] || 0}`
      if (userInventory.items['48']) {
        description += `，:broken_heart:**失落的印章-沮喪英雄**x${userInventory.items['48']}`
      }

      tmpEquipments.forEach(v => {
        let equipment = equipments[v.id]
        let chance = inventorySystem.enhanceChances[equipment.quality][v.level]
        if (userInventory.items['48']) {
          chance += (10 - v.level) * 0.001 * userInventory.items['48']
        }
        if (chance > 1) {
          chance = 1
        }
        description += `\n${equipment.icon}**${equipment.displayName}**+${v.level}，消耗 :sparkles:x1，**${(chance * 100).toFixed(2)}%**，\`87!enhance ${equipment.name}+${v.level}\``
      })
    }
  } else if (args[1] === 'rarity') { // hero rarity
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
    let tmp = args[1].split('+')
    let target = {
      name: tmp[0],
      level: parseInt(tmp[1] || 0),
      index: -1,
      id: -1,
      quality: ''
    }

    if (!Number.isSafeInteger(target.level)) {
      sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
      return
    }

    target.index = userInventory.equipments.findIndex((equipment, index) => {
      if (target.name === equipments[equipment.id].name && target.level === equipment.level) {
        target.id = equipment.id
        target.quality = equipments[equipment.id].quality || 'base'
        return true
      }
      return false
    })
    if (target.index === -1) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (!userInventory.items['46']) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_ENOUGH' })
      return
    }
    userInventory.items['46'] -= 1

    if (target.level >= inventorySystem.enhanceChances[target.quality].length) {
      sendResponseMessage({ message, errorCode: 'ERROR_MAX_LEVEL' })
      return
    }

    description = `:arrow_double_up: ${message.member.displayName} 消耗 :sparkles:**英雄裝備強化粉末**x1\n\n`

    let chance = inventorySystem.enhanceChances[target.quality][target.level]
    if (userInventory.items['48']) {
      chance += (10 - target.level) * 0.001 * userInventory.items['48']
    }
    let luck = Math.random()
    if (luck < chance) {
      delete userInventory.items['48']
      userInventory.equipments[target.index].level += 1
      description += `強化成功，獲得了 ${equipments[target.id].icon}**${equipments[target.id].displayName}**+${target.level + 1}`
    } else {
      if (!userInventory.items['48']) {
        userInventory.items['48'] = 0
      }
      userInventory.items['48'] += 1
      description += `強化失敗，裝備維持原本的模樣\n目前累積 :broken_heart:**失落的印章-沮喪英雄**x${userInventory.items['48']}`
    }
  }

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  // response
  sendResponseMessage({ message, description })
}
