const inventorySystem = require('../util/inventorySystem')
const equipments = require('../util/equipments')

module.exports = async ({ args, database, message, guildId, userId }) => {
  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status === 'fishing') {
    return { errorCode: 'ERROR_IS_FISHING' }
  }

  let description

  if (args.length === 1) {
    description = `:arrows_counterclockwise: ${message.member.displayName} 可以拆解的英雄裝備：\n`

    userInventory.equipments.forEach(v => {
      const equipment = equipments[v.id]
      description += `\n${equipment.icon}**${equipment.displayName}**+${v.level}，\`87!refine ${equipment.name}+${v.level}\``
    })

    return { description }
  }

  const targetIndex = inventorySystem.findEquipmentIndex(userInventory, args[1])

  if (targetIndex === -1) {
    return { errorCode: 'ERROR_NOT_FOUND' }
  }

  const equipment = equipments[userInventory.equipments[targetIndex].id]
  const targetLevel = userInventory.equipments[targetIndex].level

  if (!userInventory.items['46']) {
    userInventory.items['46'] = 0
  }
  userInventory.items['46'] += targetLevel + 1
  userInventory.equipments = userInventory.equipments.filter((v, i) => i !== targetIndex)

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  return { description: `:arrows_counterclockwise: ${message.member.displayName} 拆解了 ${equipment.icon}**${equipment.displayName}**+${targetLevel}，獲得 :sparkles:**英雄裝備強化粉末**x${targetLevel + 1}` }
}
