const moment = require('moment')
const config = require('../config')
const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const items = require('../util/items')

const randomInt = (range) => Math.floor(Math.random() * (range[1] - range[0] + 1) + range[0])

const monsters = [
  null,
  // rarity, level, [str, vit, agi, int, luk], [atk, def, spd, hit, ev], { drops }
  [1, 1, [0, 0, 0, 0, 0], [10, 10, 8, 5, 5], { '49.1-1': 1, '50.1-1': 0.15 }], // 1
  [1, 2, [0, 0, 0, 0, 0], [12, 12, 10, 6, 6], { '49.1-1': 1, '50.1-1': 0.20 }], // 2
  [1, 3, [0, 0, 0, 0, 0], [14, 14, 12, 7, 7], { '49.1-2': 1, '50.1-1': 0.25 }], // 3
  [1, 4, [0, 0, 0, 0, 0], [16, 16, 14, 8, 8], { '49.1-2': 1, '50.1-1': 0.30 }], // 4
  [1, 5, [0, 0, 0, 0, 0], [18, 18, 16, 9, 9], { '49.1-3': 1, '50.1-1': 0.35 }], // 5
  [2, 6, [0, 0, 0, 0, 0], [20, 20, 18, 10, 10], { '49.1-3': 1, '50.1-1': 0.40 }], // 6
  [2, 7, [0, 0, 0, 0, 0], [22, 22, 20, 11, 11], { '49.1-4': 1, '50.1-1': 0.45 }], // 7
  [2, 8, [0, 0, 0, 0, 0], [24, 24, 22, 12, 12], { '49.1-4': 1, '50.1-1': 0.50 }], // 8
  [2, 9, [0, 0, 0, 0, 0], [26, 26, 24, 13, 13], { '49.1-5': 1, '50.1-1': 0.55 }], // 9
  [2, 10, [0, 0, 0, 0, 0], [28, 28, 26, 14, 14], { '49.1-5': 1, '50.1-1': 0.60 }] // 10
]

const monsterCharacter = (monster, exclude = '') => {
  let species = ''
  while (species === '' || species === exclude) {
    species = heroSystem.species[Math.floor(Math.random() * heroSystem.species.length)]
  }

  const name = `${species}.${Math.floor(Math.random() * 99 + 1)}`
  return {
    species,
    name,
    rarity: monster[0],
    level: monster[1],
    str: monster[2][0],
    vit: monster[2][1],
    agi: monster[2][2],
    int: monster[2][3],
    luk: monster[2][4],
    atk: monster[3][0],
    def: monster[3][1],
    spd: monster[3][2],
    hit: monster[3][3],
    ev: monster[3][4],
    drops: monster[4]
  }
}

const battleProgess = (battleMessage, battleResults, userHero, enemy) => new Promise((resolve, reject) => {
  const records = heroSystem.battleRecords(userHero, enemy)
  let round = 0

  const interval = setInterval(() => {
    if (records[round].damage) {
      if (records[round].order) {
        battleResults.description += `\n第 \`${round + 1}\` 回合：:${enemy.species}: 對 :${userHero.species}: 造成了 ${records[round].damage} 點傷害，:${userHero.species}: \`HP\`: ${records[round].attackerHp}`
      } else {
        battleResults.description += `\n第 \`${round + 1}\` 回合：:${userHero.species}: 對 :${enemy.species}: 造成了 ${records[round].damage} 點傷害，:${enemy.species}: \`HP\`: ${records[round].defenderHp}`
      }
    } else {
      if (records[round].order) {
        battleResults.description += `\n第 \`${round + 1}\` 回合：:${enemy.species}: 的攻擊被 :${userHero.species}: 閃過了`
      } else {
        battleResults.description += `\n第 \`${round + 1}\` 回合：:${userHero.species}: 的攻擊被 :${enemy.species}: 閃過了`
      }
    }

    battleMessage.edit({
      embed: {
        color: 0xffe066,
        description: battleResults.description
      }
    })

    if (records[round + 1] && records[round].attackerHp && records[round].defenderHp) {
      round++
    } else {
      clearInterval(interval)
      setTimeout(() => {
        battleMessage.delete()
        if (records[round].defenderHp <= 0) {
          battleResults.win = true
          resolve()
        } else {
          resolve()
        }
      }, 3000)
    }
  }, 3000)
})

module.exports = async ({ args, database, message, guildId, userId }) => {
  let targetFloor = 1

  if (args[1]) {
    targetFloor = parseInt(args[1])
    if (!Number.isSafeInteger(targetFloor) || targetFloor < 1) {
      return { errorCode: 'ERROR_FORMAT' }
    }
    if (!monsters[targetFloor]) {
      return { errorCode: 'ERROR_TOP_FLOOR' }
    }
  }

  const lastUsed = (await database.ref(`/lastUsed/tower/${guildId}/${userId}`).once('value')).val()
  if (lastUsed) {
    const nextOpen = lastUsed + config.tick * 10
    if (message.createdTimestamp < nextOpen) {
      return { description: `:fleur_de_lis: ${message.member.displayName} 下次能夠挑戰魔神之塔的時間為：${moment(nextOpen).format('HH:mm:ss')}` }
    }
  }

  // inventory system
  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status !== 'stay') {
    return { errorCode: 'ERROR_IS_BUSY' }
  }

  if (!userInventory.items['28'] || userInventory.items['28'] < 10) {
    return { errorCode: 'ERROR_NOT_ENOUGH' }
  }

  if (!userInventory.items['31']) {
    userInventory.items['31'] = 0
  }
  if (targetFloor > userInventory.items['31'] + 1 || !args[1]) {
    targetFloor = userInventory.items['31'] + 1
  }
  if (targetFloor > monsters.length - 1) {
    targetFloor = monsters.length - 1
  }

  // hero system
  const userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (userHero.status !== 'stay') {
    return { errorCode: 'ERROR_HERO_BUSY' }
  }

  // tower
  await database.ref(`/lastUsed/tower/${guildId}/${userId}`).set(message.createdTimestamp)

  const enemy = monsterCharacter(monsters[targetFloor], userHero.species)

  const battleResults = {
    description: `:fleur_de_lis: ${message.member.displayName} 消耗了 ${items['28'].icon}${items['28'].displayName}x10 帶著英雄挑戰魔神之塔\n\n` +
      `**第 ${targetFloor} 層** \n` +
      `:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)} **Lv.${userHero.level}**，\`HP\`: ${20 + userHero.level * 2} \n` +
      `:${enemy.species}: **${enemy.name}** ${heroSystem.rarityDisplay(enemy.rarity)} **Lv.${enemy.level}**，\`HP\`: ${20 + enemy.level * 2}\n`,
    win: false
  }

  const battleMessage = await message.channel.send({
    embed: {
      color: 0xffe066,
      description: battleResults.description
    }
  })

  userInventory.status = 'tower'
  userInventory.items['28'] -= 10
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  userHero.status = 'tower'
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  await battleProgess(battleMessage, battleResults, userHero, enemy)

  // tower result
  if (battleResults.win) {
    battleResults.description += '\n\n討伐任務完成！'

    const expGain = 1 + Math.floor(Math.random() * targetFloor)
    userHero.exp += expGain
    battleResults.description += `\n獲得 ${expGain} 點英雄經驗值`

    const itemGet = {}
    if (userInventory.items['31'] < targetFloor) {
      itemGet[31] = 1
    }

    let luck = Math.random()
    if (luck < 0.1) {
      itemGet[29] = 1
    }

    for (const itemRaw in enemy.drops) {
      luck = Math.random()
      if (luck < enemy.drops[itemRaw]) {
        const itemData = itemRaw.split('.')
        itemGet[itemData[0]] = randomInt(itemData[1].split('-').map(v => parseInt(v)))
      }
    }

    for (const id in itemGet) {
      if (!userInventory.items[id]) {
        userInventory.items[id] = 0
      }
      userInventory.items[id] += itemGet[id]
      battleResults.description += ` ${items[id].icon}**${items[id].displayName}**x${itemGet[id]}`
    }
  } else {
    battleResults.description += '\n\n任務失敗。英雄鎩羽而歸'
  }

  // udpate database
  userInventory.status = 'stay'
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)
  userHero.status = 'stay'
  heroSystem.write(database, guildId, userId, userHero, message.createdTimestamp)

  return { description: battleResults.description }
}
