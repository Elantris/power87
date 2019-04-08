const emoji = require('node-emoji')
const energy = require('../util/energy')
const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const items = require('../util/items')

module.exports = ({ args, database, fishing, message, guildId, userId }) => {
  if (args.length !== 2) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  if (fishing[guildId] && fishing[guildId][userId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    let soldItems = {}
    let gainEnergy = 0
    let target = emoji.unemojify(args[1]).toLowerCase()

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

    if (gainEnergy === 0) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
      return
    }

    database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energy.INITIAL_USER_ENERGY
      }
      userEnergy += gainEnergy

      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      database.ref(`/inventory/${guildId}/${userId}`).set(inventory.makeInventory(userInventory))

      let soldItemsNumber = 0
      let soldItemsDisplay = ``
      for (let itemId in soldItems) {
        soldItemsNumber += soldItems[itemId]
        soldItemsDisplay += `${items[itemId].icon}${items[itemId].displayName}x${soldItems[itemId]} `
      }

      sendResponseMessage({ message, description: `:moneybag: ${message.member.displayName} 販賣了 ${soldItemsNumber} 件物品，獲得了 ${gainEnergy} 點八七能量\n\n${soldItemsDisplay}` })
    })
  })
}
