const inventory = require('../util/inventory')

module.exports = ({ args, database, fishing, message, guildId, userId }) => {
  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val() || ''
    if (!snapshot.exists()) {
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    let inventoryDisplay = `\n\n道具：`

    for (let tool in userInventory.tools) {
      inventoryDisplay += ` ${inventory.tools[tool].icon} ${inventory.tools[tool].name}+${userInventory.tools[tool]}`
    }

    let bagLevel = parseInt(userInventory.tools.$Bag || -1)
    inventoryDisplay += `\n\n物品：[${userInventory.items.length}/${(bagLevel + 1) * 8}]`

    userInventory.items.forEach((item, index) => {
      if (index % 8 === 0) {
        inventoryDisplay += '\n'
      } else {
        inventoryDisplay += ' '
      }
      inventoryDisplay += `:${inventory.items[item.id].icon}:`
    })

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:diamond_shape_with_a_dot_inside: ${message.member.displayName} 的資產${inventoryDisplay}`
      }
    })
  })
}
