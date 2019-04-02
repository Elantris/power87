const energy = require('../util/energy')
const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const tools = require('../util/tools')

module.exports = ({ args, database, fishing, message, guildId, userId }) => {
  if (args.length !== 2) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  if (fishing[guildId] && fishing[guildId][userId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  let toolId = ''
  let targetLevel = 0
  let target = args[1].toLowerCase()

  for (let id in tools) {
    if (target === tools[id].name) {
      toolId = id
      break
    }
  }

  if (!toolId) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    if (userInventory.tools[toolId]) {
      targetLevel = parseInt(userInventory.tools[toolId]) + 1
      if (targetLevel > tools[toolId].maxLevel) {
        sendResponseMessage({ message, errorCode: 'ERROR_MAX_LEVEL' })
        return
      }
    }

    database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energy.INITIAL_USER_ENERGY
        database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      }

      let energyCost = tools[toolId].prices[targetLevel]
      if (userEnergy < energyCost) {
        sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
        return
      }

      userEnergy -= energyCost
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)

      userInventory.tools[toolId] = targetLevel
      let updates = inventory.makeInventory(userInventory)
      updates = updates.split(',').sort().join(',')
      database.ref(`/inventory/${guildId}/${userId}`).set(updates)

      sendResponseMessage({ message, description: `:shopping_cart: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，成功購買 ${tools[toolId].icon} ${tools[toolId].displayName} +${targetLevel}` })
    })
  })
}
