const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')
const inventory = require('../util/inventory')

module.exports = ({ args, database, fishing, message, guildId, userId }) => {
  if (args.length !== 2) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  if (fishing[guildId] && fishing[guildId][userId]) {
    sendErrorMessage(message, 'ERROR_IS_FISHING')
    return
  }

  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val() || ''
    if (!snapshot.exists()) {
      database.ref(`/inventory/${guildId}/${userId}`).set(inventoryRaw)
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    let soldItems = {}
    let gainEnergy = 0

    userInventory.items = userInventory.items.map(item => {
      if (args[1] === 'all' || inventory.items[item.id].icon === args[1]) {
        if (!soldItems[item.id]) {
          soldItems[item.id] = 0
        }
        soldItems[item.id]++
        gainEnergy += inventory.items[item.id].value
        return null
      }
      return item
    }).filter(v => v)

    if (gainEnergy === 0) {
      sendErrorMessage(message, 'ERROR_NOT_FOUND')
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

      let soldItemsDisplay = ``
      let soldItemsNumber = 0
      for (let itemId in soldItems) {
        soldItemsDisplay += `:${inventory.items[itemId].icon}:x${soldItems[itemId]} `
        soldItemsNumber += soldItems[itemId]
      }

      message.channel.send({
        embed: {
          color: 0xffe066,
          description: `:moneybag: ${message.member.displayName} 販賣了 ${soldItemsNumber} 件物品，獲得了 ${gainEnergy} 點八七點數\n\n${soldItemsDisplay}`
        }
      })
    })
  })
}
