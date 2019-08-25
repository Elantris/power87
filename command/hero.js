const inventorySystem = require('../util/inventorySystem')
const heroSystem = require('../util/heroSystem')
const equipments = require('../util/equipments')

const statusMapping = {
  stay: ['閒置', '發呆', '空閑', '無聊', '站著', '坐著', '躺著'],
  tower: ['挑戰魔神之塔']
}

const statusDisplay = (status) => {
  if (!statusMapping[status]) {
    return status
  }

  return statusMapping[status][Math.floor(Math.random() * statusMapping[status].length)]
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  const userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero.name) {
    return { errorCode: 'ERROR_NO_HERO' }
  }

  let description

  if (args.length === 1) { // display hero info
    description = `:scroll: ${message.member.displayName} 召喚的英雄\n\n` +
      `:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}\n\n` +
      `成長：**Lv.${userHero.level}** (${userHero.expPercent}%)\n` +
      `飽食度：${userHero.feed < 0 ? 0 : userHero.feed}/${userHero.maxFeed} (${userHero.feedPercent}%)\n` +
      `狀態：${statusDisplay(userHero.status)}\n\n` +
      `體質：\`STR\`: ${userHero.str} / \`VIT\`: ${userHero.vit} / \`AGI\`: ${userHero.agi} / \`INT\`: ${userHero.int} / \`LUK\`: ${userHero.luk}\n` +
      `戰鬥：\`ATK\`: ${userHero.atk} / \`DEF\`: ${userHero.def} / \`SPD\`: ${userHero.spd} / \`HIT\`: ${userHero.hit} / \`EV\`: ${userHero.ev}`

    description += '\n武器：'
    if (userHero.weapon) {
      const abilities = inventorySystem.calculateAbility(userHero.weapon.id, userHero.weapon.level)
      description += `:crossed_swords:**${equipments[userHero.weapon.id].displayName}**+${userHero.weapon.level}，` +
        `\`ATK\`: ${abilities[0]} / \`HIT\`: ${abilities[1]} / \`SPD\`: ${abilities[2]}`
    }
    description += '\n防具：'
    if (userHero.armor) {
      const abilities = inventorySystem.calculateAbility(userHero.armor.id, userHero.armor.level)
      description += `:shield:**${equipments[userHero.armor.id].displayName}**+${userHero.armor.level}，` +
        `\`DEF\`: ${abilities[0]} / \`EV\`: ${abilities[1]} / \`SPD\`: ${abilities[2]}`
    }
  } else { // equip weapon or armor
    const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

    const targetIndex = inventorySystem.findEquipmentIndex(userInventory, args[1].toLowerCase())
    if (targetIndex === -1) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }

    const equipment = equipments[userInventory.equipments[targetIndex].id]

    if (userHero[equipment.kind]) {
      userInventory.equipments.push({
        id: userHero[equipment.kind].id,
        level: userHero[equipment.kind].level
      })
    }

    userHero[equipment.kind] = {
      id: userInventory.equipments[targetIndex].id,
      level: userInventory.equipments[targetIndex].level
    }

    userInventory.equipments = userInventory.equipments.filter((v, i) => i !== targetIndex)
    userInventory.equipments.sort((a, b) => a.id - b.id || b.level - a.level)

    inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

    description = `:scroll: ${message.member.displayName} 召喚的英雄\n\n` +
      `:${userHero.species}: **${userHero.name}** ` +
      `裝備了 ${equipment.icon}**${equipment.displayName}**+${userHero[equipment.kind].level}`
  }

  // update database
  heroSystem.write(database, guildId, userId, userHero)

  // response
  return { description }
}
