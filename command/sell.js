const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let results = []
  let amount = 10000
  let description = ''

  if (args[1]) {
    results = findTargets(args[1].toLowerCase()).filter(result => result.type === 'item')
    if (results.length === 0) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return 0
    }
  }

  if (args[2]) {
    amount = parseInt(args[2])
    if (!Number.isSafeInteger(amount) || amount < 1) {
      sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
      return
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  if (args.length === 1) { // no arguments
    description = `:moneybag: ${message.member.displayName} 背包內可以販賣的物品：\n`

    inventorySystem.kindOrders.forEach(kind => {
      for (let id in userInventory.items) {
        if (items[id].kind === kind) {
          description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}，:battery: ${items[id].value}，\`87!sell ${items[id].name} ${userInventory.items[id]}\``
        }
      }
    })

    sendResponseMessage({ message, description })
    return
  }

  let soldItems = {}
  let soldItemsCount = 0
  let gainEnergy = 0

  results.forEach(result => {
    if (!userInventory.items[result.id]) {
      return
    }

    if (!soldItems[result.id]) {
      soldItems[result.id] = 0
    }

    let tmpAmount = amount
    if (tmpAmount > userInventory.items[result.id]) {
      tmpAmount = userInventory.items[result.id]
    }

    soldItems[result.id] += tmpAmount
    soldItemsCount += tmpAmount
    gainEnergy += tmpAmount * items[result.id].value
    userInventory.items[result.id] -= tmpAmount
  })

  if (soldItemsCount === 0) {
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

  sendResponseMessage({ message, description: `:moneybag: ${message.member.displayName} 販賣 ${soldItemsCount} 件物品，獲得了 ${gainEnergy} 點八七能量\n\n${soldItemsDisplay}` })
}
