const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const tools = require('../util/tools')
const items = require('../util/items')

module.exports = ({ args, database, message, guildId, userId }) => {
  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    let inventoryDisplay = `\n\n道具：`

    for (let tool in userInventory.tools) {
      inventoryDisplay += ` ${tools[tool].icon}+${userInventory.tools[tool]}`
    }

    inventoryDisplay += `\n\n物品：[${userInventory.items.length}/${userInventory.maxSlots}]`

    userInventory.items.sort((itemA, itemB) => {
      if (items[itemA.id].kind < items[itemB.id].kind) {
        return -1
      }
      if (items[itemA.id].kind > items[itemB.id].kind) {
        return 1
      }
      return (items[itemB.id].value - items[itemA.id].value) || (itemA.id - itemB.id)
    }).forEach((item, index) => {
      if (index % 8 === 0) {
        inventoryDisplay += '\n'
      } else {
        inventoryDisplay += ' '
      }
      inventoryDisplay += `${items[item.id].icon}`
    })

    sendResponseMessage({ message, description: `:diamond_shape_with_a_dot_inside: ${message.member.displayName} 的資產${inventoryDisplay}` })
  })
}
