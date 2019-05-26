const emoji = require('node-emoji')

const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const sendResponseMessage = require('../util/sendResponseMessage')

const usableKinds = {
  buff: true
}

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  // check target exists
  let target = {}
  if (args[1]) {
    let search = args[1].toLowerCase()

    for (let itemId in items) {
      if (search === items[itemId].name || search === emoji.emojify(items[itemId].icon) || emoji.unemojify(search) === items[itemId].icon || search === items[itemId].displayName) {
        target = {
          itemId,
          kind: items[itemId].kind,
          amount: parseInt(args[2] || 1)
        }
        break
      }
    }

    if (!target.itemId) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (!usableKinds[target.kind]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_USABLE' })
      return
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let description = ''

  // no arguments
  if (args.length === 1) {
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以使用的道具：\n`

    for (let itemId in userInventory.items) {
      if (usableKinds[items[itemId].kind]) {
        description += `\n${items[itemId].icon}**${items[itemId].displayName}**x${userInventory.items[itemId]}，\`87!use ${items[itemId].name}\``
      }
    }

    sendResponseMessage({ message, description })
    return
  }

  // user target
  if (userInventory.status === 'fishing') {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  if (!userInventory.items[target.itemId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
    return
  }

  if (target.amount > userInventory.items[target.itemId]) {
    target.amount = userInventory.items[target.itemId]
  }

  if (target.kind === 'buff') {
    let buffId = items[target.itemId].buffId
    // extend duration of buff
    if (!userInventory.buffs[buffId]) {
      userInventory.buffs[buffId] = message.createdTimestamp
    }
    userInventory.buffs[buffId] = userInventory.buffs[buffId] + items[target.itemId].duration * target.amount

    description = `:arrow_double_up: ${message.member.displayName} 使用了 ${items[target.itemId].icon}**${items[target.itemId].displayName}**x${target.amount}`
  }

  // update database
  userInventory.items[target.itemId] -= target.amount
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  sendResponseMessage({ message, description })
}
