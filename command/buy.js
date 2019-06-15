const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  // check target exists
  let description = ''
  let target = {}
  if (args[1]) {
    let results = findTargets(args[1].toLowerCase())
    if (results.length === 0) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (results.length !== 1) {
      description = `:shopping_cart: 指定其中一種道具/物品：\n`
      results.filter(result => items[result.id].price).forEach(result => {
        let item = items[result.id]
        description += `\n${item.icon}**${item.displayName}**，\`${item.kind}/${item.name}\`，\`87!buy ${item.name}\``
      })
      sendResponseMessage({ message, description })
      return
    }

    target = results[0]
    if (target.type === 'tool') {
      target.level = 0
      target.price = tools[target.id].prices[0]
      target.amount = 1
    } else if (target.type === 'item') {
      target.price = items[target.id].price
      target.amount = parseInt(args[2] || 1)
    } else {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  // no arguments
  if (args.length === 1) {
    description = `:shopping_cart: ${message.member.displayName} 可購買的商品：\n\n__裝備道具__：`
    for (let id in tools) {
      let toolLevel = 0
      if (userInventory.tools[id]) {
        toolLevel = parseInt(userInventory.tools[id]) + 1
        if (toolLevel > tools[id].maxLevel) {
          continue
        }
      }

      description += `\n${tools[id].icon}**${tools[id].displayName}**+${toolLevel}，:battery: **${tools[id].prices[toolLevel]}**，\`87!buy ${tools[id].name}\``
    }

    description += `\n\n__特色商品__：\`87!buy :emoji:\`\n`
    for (let id in items) {
      if (items[id].price) {
        description += `${items[id].icon} `
      }
    }

    sendResponseMessage({ message, description })
    return
  }

  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  // user target
  if (target.type === 'tool' && userInventory.tools[target.id]) {
    target.level = parseInt(userInventory.tools[target.id]) + 1

    if (target.level > tools[target.id].maxLevel) {
      sendResponseMessage({ message, errorCode: 'ERROR_MAX_LEVEL' })
      return
    }

    target.price = tools[target.id].prices[target.level]
  } else if (target.type === 'item') {
    target.maxBuy = items[target.id].maxStack * userInventory.emptySlots

    if (userInventory.items[target.id] && userInventory.items[target.id] % items[target.id].maxStack) {
      target.maxBuy += items[target.id].maxStack - userInventory.items[target.id] % items[target.id].maxStack
    }

    if (target.amount > target.maxBuy) {
      target.amount = target.maxBuy
    }

    if (target.amount <= 0) {
      sendResponseMessage({ message, errorCode: 'ERROR_BAG_FULL' })
      return
    }
  }

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
  }

  let energyCost = target.price * target.amount
  if (userEnergy < energyCost) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
    return
  }

  // update database
  if (target.type === 'tool') {
    userInventory.tools[target.id] = target.level.toString()
  } else if (target.type === 'item') {
    if (!userInventory.items[target.id]) {
      userInventory.items[target.id] = 0
    }
    userInventory.items[target.id] += target.amount
  }

  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  description = `:shopping_cart: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，購買了 `
  if (target.type === 'tool') {
    description += `${tools[target.id].icon}**${tools[target.id].displayName}**+${target.level}`
  } else if (target.type === 'item') {
    description += `${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}`
  }

  sendResponseMessage({ message, description })
}
