const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let description = `:diamond_shape_with_a_dot_inside: ${message.member.displayName} 擁有的印章：\n`
  for (let id in userInventory.items) {
    if (items[id].kind === 'mark') {
      description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}`
    }
  }

  sendResponseMessage({ message, description })
}
