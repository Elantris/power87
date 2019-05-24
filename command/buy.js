const emoji = require('node-emoji')

const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const findTarget = require('../util/findTarget')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let target = {}

  // check target exists
  if (args[1]) {
    target = findTarget(emoji.unemojify(args[1]).toLowerCase())

    if (!target.id || !target.price) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (args[2]) {
      target.amount = parseInt(args[2])
    } else {
      target.amount = 1
    }
  }

  let userInventory = inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  // no arguments
  if (args.length === 1) {
    let description = `:shopping_cart: ${message.member.displayName} 可購買的商品：\n\n__裝備道具__：`

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

    description += `\n\n__特色商品__：\n`

    for (let id in items) {
      if (items[id].price) {
        description += `${items[id].icon} \`${items[id].name}\` `
      }
    }

    sendResponseMessage({ message, description })
    return
  }

  let fishingRaw = await database.ref(`/fishing/${guildId}/${userId}`).once('value')
  if (fishingRaw.exists()) {
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
    if (!userInventory.hasEmptySlot || userInventory.items.length + target.amount > userInventory.maxSlots) {
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
    userInventory.tools[target.id] = target.level
  } else if (target.type === 'item') {
    for (let i = 0; i < target.amount; i++) {
      userInventory.items.push({
        id: target.id,
        amount: 1
      })
    }
  }

  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  inventorySystem.set(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  let description = `:shopping_cart: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，購買了 `
  if (target.type === 'tool') {
    description += `${tools[target.id].icon}**${tools[target.id].displayName}**+${target.level}`
  } else if (target.type === 'item') {
    description += `${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}`
  }

  sendResponseMessage({ message, description })
}
