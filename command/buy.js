const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const findTargets = require('../util/findTargets')

const availableKinds = {
  buff: true,
  petfood: true,
  box: true,
  hero: true,
  enhance: true,
  equipment: true
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let description
  let target = {}

  if (args[1]) {
    let results = findTargets(args[1].toLowerCase()).filter(result => result.type === 'tool' || (result.type === 'item' && 'price' in items[result.id]))

    if (results.length === 0) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }

    if (results.length > 1) {
      description = `:shopping_cart: 指定其中一種道具/物品：\n`
      results.forEach(result => {
        let item = items[result.id]
        description += `\n${item.icon}**${item.displayName}**，:battery: **${item.price}**，\`87!buy ${item.name}\``
      })
      return { description }
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
      return { errorCode: 'ERROR_NOT_FOUND' }
    }
  }

  if (target.type === 'item' && args[2]) {
    if (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1) {
      return { errorCode: 'ERROR_FORMAT' }
    }

    target.amount = parseInt(args[2])
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status === 'fishing') {
    return { errorCode: 'ERROR_IS_FISHING' }
  }

  if (args.length === 1) {
    description = `:shopping_cart: ${message.member.displayName} 可購買的商品：`

    description += `\n\n__功能道具__：`
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
    description += Object.keys(availableKinds).map(kind => `${inventorySystem.kindNames[kind]}，\`87!buy ${kind}\``).join('\n')

    return { description }
  }

  if (target.type === 'tool') {
    if (userInventory.tools[target.id]) {
      target.level = parseInt(userInventory.tools[target.id]) + 1

      if (target.level > tools[target.id].maxLevel) {
        return { errorCode: 'ERROR_MAX_LEVEL' }
      }
    }

    target.price = tools[target.id].prices[target.level]
    userInventory.tools[target.id] = target.level.toString()
  } else if (target.type === 'item') {
    target.maxBuy = items[target.id].maxStack * userInventory.emptySlots

    if (userInventory.items[target.id] && userInventory.items[target.id] % items[target.id].maxStack) {
      target.maxBuy += items[target.id].maxStack - userInventory.items[target.id] % items[target.id].maxStack
    }

    if (target.maxBuy <= 0) {
      return { errorCode: 'ERROR_BAG_FULL' }
    }

    if (target.amount > target.maxBuy) {
      target.amount = target.maxBuy
    }
    if (!userInventory.items[target.id]) {
      userInventory.items[target.id] = 0
    }
    userInventory.items[target.id] += target.amount
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
    return { errorCode: 'ERROR_NO_ENERGY' }
  }

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  description = `:shopping_cart: ${message.member.displayName} 消耗 ${energyCost} 點八七能量，購買了 `
  if (target.type === 'tool') {
    description += `${tools[target.id].icon}**${tools[target.id].displayName}**+${target.level}`
  } else if (target.type === 'item') {
    description += `${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}`
  }

  return { description }
}
