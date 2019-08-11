const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const findTargets = require('../util/findTargets')

module.exports = async ({ args, database, message, guildId, userId }) => {
  let results = []
  let amount = 10000
  let description

  if (args[1]) {
    results = findTargets(args[1].toLowerCase()).filter(result => result.type === 'item' && 'value' in items[result.id])
    if (results.length === 0) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }
  }

  if (args[2]) {
    amount = parseInt(args[2])
    if (!Number.isSafeInteger(amount) || amount < 1) {
      return { errorCode: 'ERROR_FORMAT' }
    }
  }

  // inventory system
  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status !== 'stay') {
    return { errorCode: 'ERROR_IS_BUSY' }
  }

  // no arguments
  if (args.length === 1) {
    description = `:moneybag: ${message.member.displayName} 背包內可以販賣的物品：\n`

    inventorySystem.kindOrders.forEach(kind => {
      for (const id in userInventory.items) {
        if (items[id].kind === kind && 'value' in items[id]) {
          description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}，\`${kind}\`，:battery: **${items[id].value}**，\`87!sell ${items[id].name} ${userInventory.items[id]}\``
        }
      }
    })

    return { description }
  }

  const soldItems = {}
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
    return { errorCode: 'ERROR_NO_ITEM' }
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
  description = `:moneybag: ${message.member.displayName} 販賣 ${soldItemsCount} 件物品，獲得了 ${gainEnergy} 點八七能量\n\n`
  for (const id in soldItems) {
    description += `${items[id].icon}**${items[id].displayName}**x${soldItems[id]} `
  }

  return { description }
}
