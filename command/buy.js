const emoji = require('node-emoji')

const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  // check target exists
  let target = {}
  if (args[1]) {
    let search = args[1].toLowerCase()
    for (let toolId in tools) {
      if (search === tools[toolId].name || search === emoji.emojify(tools[toolId].icon) || emoji.unemojify(search) === tools[toolId].icon || search === tools[toolId].displayName) {
        target = {
          toolId,
          type: 'tool',
          price: tools[toolId].prices[0],
          level: 0
        }
      }
    }

    for (let itemId in items) {
      if (search === items[itemId].name || search === emoji.emojify(items[itemId].icon) || emoji.unemojify(search) === items[itemId].icon || search === items[itemId].displayName) {
        target = {
          itemId,
          type: 'item',
          price: items[itemId].price,
          amount: parseInt(args[2] || 1)
        }
      }
    }

    if (!target.price) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }
  }

  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  // no arguments
  if (args.length === 1) {
    let description = `:shopping_cart: ${message.member.displayName} 可購買的商品：\n\n__裝備道具__：`
    for (let toolId in tools) {
      let toolLevel = 0
      if (userInventory.tools[toolId]) {
        toolLevel = parseInt(userInventory.tools[toolId]) + 1
        if (toolLevel > tools[toolId].maxLevel) {
          continue
        }
      }

      description += `\n${tools[toolId].icon}**${tools[toolId].displayName}**+${toolLevel}，:battery: **${tools[toolId].prices[toolLevel]}**，\`87!buy ${tools[toolId].name}\``
    }

    description += `\n\n__特色商品__：\n`
    for (let itemId in items) {
      if (items[itemId].price) {
        description += `${items[itemId].icon} \`${items[itemId].name}\` `
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
  if (target.type === 'tool' && userInventory.tools[target.toolId]) {
    target.level = parseInt(userInventory.tools[target.toolId]) + 1
    if (target.level > tools[target.toolId].maxLevel) {
      sendResponseMessage({ message, errorCode: 'ERROR_MAX_LEVEL' })
      return
    }
    target.price = tools[target.toolId].prices[target.level]
  } else if (target.type === 'item') {
    target.maxBuy = items[target.itemId].maxStack * userInventory.emptySlots

    if (userInventory.items[target.itemId] && userInventory.items[target.itemId] % items[target.itemId].maxStack) {
      target.maxBuy += items[target.itemId].maxStack - userInventory.items[target.itemId] % items[target.itemId].maxStack
    }

    if (target.amount > target.maxBuy) {
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
    userInventory.tools[target.toolId] = target.level
  } else if (target.type === 'item') {
    if (!userInventory.items[target.itemId]) {
      userInventory.items[target.itemId] = 0
    }
    userInventory.items[target.itemId] += target.amount
  }

  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  let description = `:shopping_cart: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，購買了 `
  if (target.type === 'tool') {
    description += `${tools[target.toolId].icon}**${tools[target.toolId].displayName}**+${target.level}`
  } else if (target.type === 'item') {
    description += `${items[target.itemId].icon}**${items[target.itemId].displayName}**x${target.amount}`
  }

  sendResponseMessage({ message, description })
}
