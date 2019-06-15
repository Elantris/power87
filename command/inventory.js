const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const buffs = require('../util/buffs')
const sendResponseMessage = require('../util/sendResponseMessage')

const userStatusMapping = {
  stay: '在村莊裡發呆',
  fishing: '出海捕魚中',
  return: '從大洋歸來'
}

const kindOrders = ['event', 'hero', 'enhance', 'mark', 'jewel', 'box', 'buff', 'petfood', 'fishing']

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let inventoryDisplay = `\n裝備道具：`
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

  inventoryDisplay += `\n\n背包物品：[${userInventory.maxSlots - userInventory.emptySlots}/${userInventory.maxSlots}]`
  let slotContents = []
  kindOrders.forEach(kind => {
    for (let id in userInventory.items) {
      if (items[id].kind === kind) {
        for (let i = 0; i < Math.ceil(userInventory.items[id] / items[id].maxStack); i++) {
          slotContents.push(items[id].icon)
        }
      }
    }
  })
  slotContents.forEach((icon, index) => {
    if (index % 8 === 0) {
      inventoryDisplay += '\n'
    } else {
      inventoryDisplay += ' '
    }
    inventoryDisplay += icon
  })

  // response
  sendResponseMessage({ message, description: `:diamond_shape_with_a_dot_inside: ${message.member.displayName} ${userStatusMapping[userInventory.status]}\n${inventoryDisplay}` })
}
