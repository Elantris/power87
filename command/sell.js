const emoji = require('node-emoji')

const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length !== 2) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let fishingRaw = await database.ref(`/fishing/${guildId}/${userId}`).once('value')
  if (fishingRaw.exists()) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  // inventory system
  let inventoryRaw = await database.ref(`/inventory/${guildId}/${userId}`).once('value')
  let userInventory = inventorySystem.parse(inventoryRaw.val(), message.createdTimestamp)

  let soldItems = {}
  let gainEnergy = 0
  let target = emoji.unemojify(args[1]).toLowerCase()
  let originItemsLength = userInventory.items.length

  userInventory.items = userInventory.items.filter(item => {
    if (target === 'all' || target === items[item.id].kind || target === items[item.id].name || target === items[item.id].icon || target === items[item.id].displayName) {
      if (!soldItems[item.id]) {
        soldItems[item.id] = 0
      }
      soldItems[item.id] += item.amount
      gainEnergy += items[item.id].value * item.amount
      return false
    }
    return true
  })

  if (originItemsLength === userInventory.items.length) {
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
  database.ref(`/inventory/${guildId}/${userId}`).set(inventorySystem.make(userInventory, message.createdTimestamp))

  // response
  let soldItemsNumber = 0
  let soldItemsDisplay = ``
  for (let itemId in soldItems) {
    soldItemsNumber += soldItems[itemId]
    soldItemsDisplay += `${items[itemId].icon}**${items[itemId].displayName}**x${soldItems[itemId]} `
  }

  sendResponseMessage({ message, description: `:moneybag: ${message.member.displayName} 販賣了 ${soldItemsNumber} 件物品，獲得了 ${gainEnergy} 點八七能量\n\n${soldItemsDisplay}` })
}
