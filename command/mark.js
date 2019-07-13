const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')

module.exports = async ({ args, database, message, guildId, userId }) => {
  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let description = `:diamond_shape_with_a_dot_inside: ${message.member.displayName} 擁有的印章：\n`
  for (const id in userInventory.items) {
    if (items[id].kind === 'mark') {
      description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}`
    }
  }

  return { description }
}
