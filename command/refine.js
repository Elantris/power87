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

  let target = {
    name: '',
    level: '',
    index: -1,
    id: -1
  }

  let tmp = args[1].split('+')
  target.name = tmp[0]
  target.level = parseInt(tmp[1] || 0)

  if (!Number.isSafeInteger(target.level)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  target.index = userInventory.equipments.findIndex((v, index) => {
    if (target.name === equipments[v.id].name && target.level === v.level) {
      target.id = v.id
      return true
    }
    return false
  })

  if (target.index === -1) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  // update database
  if (!userInventory.items['46']) {
    userInventory.items['46'] = 0
  }
  if (userInventory.items['46'] % items['46'].maxStack === 0 && userInventory.emptySlots === 0) {
    sendResponseMessage({ message, errorCode: 'ERROR_BAG_FULL' })
    return
  }
  userInventory.items['46'] += target.level + 1
  userInventory.equipments = userInventory.equipments.filter((v, index) => index !== target.index)

  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  description = `:arrows_counterclockwise: ${message.member.displayName} 拆解了 ${equipments[target.id].icon}**${equipments[target.id].displayName}**+${target.level}，獲得 :sparkles:**英雄裝備強化粉末**x${target.level + 1}`
  sendResponseMessage({ message, description })
}
