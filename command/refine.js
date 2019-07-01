const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const equipments = require('../util/equipments')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  let description

  if (args.length === 1) { // no arguments
    description = `:arrows_counterclockwise: ${message.member.displayName} 可以拆解的英雄裝備：\n`

    userInventory.equipments.forEach(v => {
      let equipment = equipments[v.id]
      if (v.level === inventorySystem.enhanceChances[equipment.quality].length) {
        return
      }
      description += `\n${equipment.icon}**${equipment.displayName}**+${v.level}，\`87!refine ${equipment.name}+${v.level}\``
    })

    sendResponseMessage({ message, description })
    return
  }

  let targetIndex = inventorySystem.findEquipmentIndex(userInventory, args[1])

  if (targetIndex === -1) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }
  let equipment = equipments[userInventory.equipments[targetIndex].id]
  let targetLevel = userInventory.equipments[targetIndex].level

  // update database
  if (!userInventory.items['46']) {
    userInventory.items['46'] = 0
  }
  if (userInventory.items['46'] % items['46'].maxStack === 0 && userInventory.emptySlots === 0) {
    sendResponseMessage({ message, errorCode: 'ERROR_BAG_FULL' })
    return
  }
  userInventory.items['46'] += targetLevel + 1
  userInventory.equipments = userInventory.equipments.filter((v, i) => i !== targetIndex)

  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  description = `:arrows_counterclockwise: ${message.member.displayName} 拆解了 ${equipment.icon}**${equipment.displayName}**+${targetLevel}，獲得 :sparkles:**英雄裝備強化粉末**x${targetLevel + 1}`
  sendResponseMessage({ message, description })
}
