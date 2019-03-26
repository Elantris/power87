const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')
const inventory = require('../util/inventory')

module.exports = ({ args, database, message, guildId, userId }) => {
  if (args.length !== 2) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let toolName = '$' + args[1]
  let toolLevel = 0

  if (!inventory.tools[toolName]) {
    sendErrorMessage(message, 'ERROR_NOT_FOUND')
    return
  }

  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val() || ''
    if (!snapshot.exists()) {
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    if (userInventory.tools[toolName]) {
      toolLevel = parseInt(userInventory.tools[toolName]) + 1
      if (toolLevel > inventory.tools[toolName].maxLevel) {
        sendErrorMessage(message, 'ERROR_MAX_LEVEL')
        return
      }
    }

    let energyCost = inventory.tools[toolName].prices[toolLevel]

    database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energy.INITIAL_USER_ENERGY
        database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      }
      if (userEnergy < energyCost) {
        sendErrorMessage(message, 'ERROR_NO_ENERGY')
        return
      }

      userEnergy -= energyCost
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)

      userInventory.tools[toolName] = toolLevel
      database.ref(`/inventory/${guildId}/${userId}`).set(inventory.makeInventory(userInventory))

      message.channel.send({
        embed: {
          color: 0xffe066,
          description: `:shopping_cart: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，成功購買 ${inventory.tools[toolName].icon} ${inventory.tools[toolName].name} +${toolLevel}`
        }
      })
    })
  })
}
