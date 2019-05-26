const emoji = require('node-emoji')

const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length < 2) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  let search = args[1].toLowerCase()

  let soldItems = {}
  let gainEnergy = 0
  let soldItemsNumber = 0

  for (let itemId in userInventory.items) {
    if (search === 'all' || search === items[itemId].kind || search === items[itemId].name || search === emoji.emojify(items[itemId].icon) || items[itemId].displayName) {
      if (!soldItems[itemId]) {
        soldItems[itemId] = 0
      }
      soldItems[itemId] += userInventory.items[itemId]
      soldItemsNumber += userInventory.items[itemId]
      userInventory.items[itemId] = 0
    }
  }

  if (soldItems === 0) {
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
  for (let itemId in soldItems) {
    soldItemsDisplay += `${items[itemId].icon}**${items[itemId].displayName}**x${soldItems[itemId]} `
  }

  sendResponseMessage({ message, description: `:moneybag: ${message.member.displayName} 販賣了 ${soldItemsNumber} 件物品，獲得了 ${gainEnergy} 點八七能量\n\n${soldItemsDisplay}` })
}
