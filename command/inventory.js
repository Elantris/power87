const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const buffs = require('../util/buffs')
const equipments = require('../util/equipments')
const sendResponseMessage = require('../util/sendResponseMessage')

const userStatusMapping = {
  stay: '在村莊裡發呆',
  fishing: '出海捕魚中',
  return: '從大洋歸來'
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let inventoryDisplay = `\n功能道具：`
  for (let id in userInventory.tools) {
    inventoryDisplay += `${tools[id].icon}+${userInventory.tools[id]} `
  }

  inventoryDisplay += `\n增益效果：`
  for (let id in userInventory.buffs) {
    if (userInventory.buffs[id] > message.createdTimestamp) {
      let buffTime = (userInventory.buffs[id] - message.createdTimestamp) / 60000
      let buffTimeHour = Math.floor(buffTime / 60).toString().padStart(2, '0')
      let buffTimeMinute = Math.floor(buffTime % 60).toString().padStart(2, '0')
      inventoryDisplay += `${items[buffs[id]].icon}${buffTimeHour}:${buffTimeMinute}`
    }
  }

  inventoryDisplay += `\n\n背包物品：**[${userInventory.maxSlots - userInventory.emptySlots}/${userInventory.maxSlots}]**`
  let slotContents = []
  inventorySystem.kindOrders.forEach(kind => {
    for (let id in userInventory.items) {
      if (items[id].kind === kind) {
        for (let i = 0; i < Math.ceil(userInventory.items[id] / items[id].maxStack); i++) {
          slotContents.push(items[id].icon)
        }
      }
    }
  })
  slotContents.forEach((icon, index) => {
    if (index % 12 === 0) {
      inventoryDisplay += '\n'
    } else {
      inventoryDisplay += ' '
    }
    inventoryDisplay += icon
  })

  inventoryDisplay += `\n\n英雄裝備：**[${userInventory.equipments.length}/8]**`
  userInventory.equipments.forEach(v => {
    let equipment = equipments[v.id]
    let abilities = inventorySystem.calculateAbility(v.id, v.level)

    inventoryDisplay += `\n${equipment.icon}**${equipment.displayName}**+${v.level}，`
    if (equipment.kind === 'weapon') {
      inventoryDisplay += `\`ATK\`: ${abilities[0]} / \`HIT\`: ${abilities[1]} / \`SPD\`: ${abilities[2]}`
    } else if (equipment.kind === 'armor') {
      inventoryDisplay += `\`DEF\`: ${abilities[0]} / \`EV\`: ${abilities[1]} / \`SPD\`: ${abilities[2]}`
    }
  })

  // response
  sendResponseMessage({ message, description: `:diamond_shape_with_a_dot_inside: ${message.member.displayName} ${userStatusMapping[userInventory.status]}\n${inventoryDisplay}` })
}
