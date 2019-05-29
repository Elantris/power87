const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length < 2) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let results = findTargets(args[1].toLowerCase())
  if (results.length === 0) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return 0
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  let soldItems = {}
  let soldItemsNumber = 0
  let gainEnergy = 0

  results.forEach(result => {
    if (!userInventory.items[result.id]) {
      return
    }

    if (!soldItems[result.id]) {
      soldItems[result.id] = 0
    }

    soldItems[result.id] += userInventory.items[result.id]
    soldItemsNumber += userInventory.items[result.id]
    gainEnergy += userInventory.items[result.id] * items[result.id].value
    userInventory.items[result.id] = 0
  })

  if (soldItemsNumber === 0) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
    return
  }

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
  }

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + gainEnergy)
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  let soldItemsDisplay = ``
  for (let id in soldItems) {
    soldItemsDisplay += `${items[id].icon}**${items[id].displayName}**x${soldItems[id]} `
  }

  sendResponseMessage({ message, description: `:moneybag: ${message.member.displayName} 販賣了 ${soldItemsNumber} 件物品，獲得了 ${gainEnergy} 點八七能量\n\n${soldItemsDisplay}` })
}
