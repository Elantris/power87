const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const buffs = require('../util/buffs')
const items = require('../util/items')
const sendResponseMessage = require('../util/sendResponseMessage')

let userStatusMapping = {
  stay: '在村莊裡發呆',
  fishing: '出海捕魚中',
  return: '從大洋歸來'
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let inventoryDisplay = `\n裝備道具：`
  for (let id in userInventory.tools) {
    inventoryDisplay += `${tools[id].icon}+${userInventory.tools[id]} `
  }

  inventoryDisplay += `\n增益效果：`
  for (let id in userInventory.buffs) {
    if (userInventory.buffs[id] > message.createdTimestamp) {
      let buffLastTime = (userInventory.buffs[id] - message.createdTimestamp) / 60000
      let buffDisplayHour = Math.floor(buffLastTime / 60).toString().padStart(2, '0')
      let buffDisplayMinute = Math.floor(buffLastTime % 60).toString().padStart(2, '0')
      inventoryDisplay += `${items[buffs[id].itemId].icon}${buffDisplayHour}:${buffDisplayMinute}`
    }
  }

  inventoryDisplay += `\n\n背包物品：[${userInventory.items.length}/${userInventory.maxSlots}]`
  userInventory.items.forEach((item, index) => {
    if (index % 8 === 0) {
      inventoryDisplay += '\n'
    } else {
      inventoryDisplay += ' '
    }
    inventoryDisplay += `${items[item.id].icon}`
  })

  // response
  sendResponseMessage({ message, description: `:diamond_shape_with_a_dot_inside: ${message.member.displayName} ${userStatusMapping[userInventory.status]}\n${inventoryDisplay}` })
}
