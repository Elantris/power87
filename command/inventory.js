const moment = require('moment')
const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const buffs = require('../util/buffs')
const equipments = require('../util/equipments')

const userStatusMapping = {
  stay: '在村莊裡發呆',
  fishing: '出海捕魚中',
  return: '從大洋歸來'
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  let description = `:diamond_shape_with_a_dot_inside: ${message.member.displayName}`

  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  description += ` ${userStatusMapping[userInventory.status]}`

  description += `\n功能道具：`
  for (const id in userInventory.tools) {
    description += `${tools[id].icon}+${userInventory.tools[id]} `
  }

  description += `\n增益效果：`
  for (const id in userInventory.buffs) {
    if (userInventory.buffs[id] > message.createdTimestamp) {
      const buffTime = moment.duration(userInventory.buffs[id] - message.createdTimestamp)
      description += `${items[buffs[id]].icon}${Math.floor(buffTime.asHours()).toString().padStart(2, '0')}:${buffTime.minutes().toString().padStart(2, '0')}`
    }
  }

  description += `\n\n背包物品：**[${userInventory.maxSlots - userInventory.emptySlots}/${userInventory.maxSlots}]**`
  const slotContents = []
  inventorySystem.kindOrders.forEach(kind => {
    for (const id in userInventory.items) {
      if (items[id].kind === kind) {
        for (let i = 0; i < Math.ceil(userInventory.items[id] / items[id].maxStack); i++) {
          slotContents.push(items[id].icon)
        }
      }
    }
  })
  slotContents.forEach((icon, index) => {
    if (index % 12 === 0) {
      description += '\n'
    } else {
      description += ' '
    }
    description += icon
  })

  description += `\n\n英雄裝備：**[${userInventory.equipments.length}/${userInventory.maxEquipments}]**`
  userInventory.equipments.forEach(v => {
    const equipment = equipments[v.id]
    const abilities = inventorySystem.calculateAbility(v.id, v.level)

    description += `\n${equipment.icon}**${equipment.displayName}**+${v.level}，`
    if (equipment.kind === 'weapon') {
      description += `\`ATK\`: ${abilities[0]} / \`HIT\`: ${abilities[1]} / \`SPD\`: ${abilities[2]}`
    } else if (equipment.kind === 'armor') {
      description += `\`DEF\`: ${abilities[0]} / \`EV\`: ${abilities[1]} / \`SPD\`: ${abilities[2]}`
    }
    description += `，\`87!hero ${equipment.name}+${v.level}\``
  })

  // response
  return { description }
}
