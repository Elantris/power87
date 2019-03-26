const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')
const inventory = require('../util/inventory')

module.exports = ({ args, database, message, guildId, userId }) => {
  if (args.length !== 2) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val() || ''
    if (!snapshot.exists()) {
      database.ref(`/inventory/${guildId}/${userId}`).set(inventoryRaw)
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    let soldItemsNumber = 0
    let gainEnergy = 0

    userInventory.items = userInventory.items.map(item => {
      if (args[1] === 'all' || inventory.items[item.id].icon === args[1]) {
        soldItemsNumber += item.amount
        gainEnergy += inventory.items[item.id].value
        return null
      }
      return item
    }).filter(v => v)

    if (soldItemsNumber === 0) {
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
      if (args[1] === 'all') {
        soldItemsDisplay = `${soldItemsNumber} 件物品`
      } else {
        soldItemsDisplay = `:${args[1]}: x${soldItemsNumber}`
      }

      message.channel.send({
        embed: {
          color: 0xffe066,
          description: `:moneybag: ${message.member.displayName} 販賣了 ${soldItemsDisplay}，獲得了 ${gainEnergy} 點八七點數`
        }
      })
    })
  })
}
