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

  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  let description

  // enhance type
  if (args.length === 1) {
    description = `:arrow_double_up: ${message.member.displayName} 可以強化的項目：`

    if (userHero.rarity < 5) {
      description += `\n\n:star:**英雄星數強化石**x${rarityCost[userHero.rarity]}\n**稀有度**：${Math.floor(rarityChances[userHero.rarity] * 100)}%，\`87!enhance rarity\``
    }

    let total = 0
    for (let i in abilities) {
      total += userHero[i]
    }
    if (total < userHero.level) {
      description += `\n\n:sparkles:**英雄體質強化粉末**x1`
      for (let i in abilities) {
        description += `\n**${abilities[i]}**：\`87!enhance ${i} 1\``
      }
    }

    description += '\n\n:sparkles:**英雄裝備強化粉末**x1'
    userInventory.equipments.forEach(v => {
      let equipment = equipments[v.id]
      if (v.level >= inventorySystem.enhanceChances[equipment.quality].length) {
        return
      }
      let chance = inventorySystem.enhanceChances[equipment.quality][v.level]
      description += `\n${equipment.icon}**${equipment.displayName}**+${v.level}，${Math.floor(chance * 100)}%，\`87!enhance ${equipment.name}+${v.level}\``
    })
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

    let luck = Math.random()
    if (luck < inventorySystem.enhanceChances[target.quality][target.level]) {
      userInventory.equipments[target.index].level += 1
      description += `強化成功，獲得了 ${equipments[target.id].icon}**${equipments[target.id].displayName}**+${target.level + 1}`
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
