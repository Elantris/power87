const inventorySystem = require('../util/inventorySystem')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
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
  let description = ''
  let target = {}
  if (args[1]) {
    let results = findTargets(args[1].toLowerCase())

    if (results.length === 0) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }

    if (results.length > 1) {
      description = `:arrow_double_up: 指定其中一種道具/物品：\n`
      results.forEach(result => {
        let item = items[result.id]
        description += `\n${item.icon}**${item.displayName}**，\`${item.kind}/${item.name}\`，\`87!use ${item.name}\``
      })
      sendResponseMessage({ message, description })
      return
    }

    target = results[0]
    target.kind = items[target.id].kind
    target.amount = parseInt(args[2] || 1)

    if (!usableKinds[target.kind]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_USABLE' })
      return
    }
  }

  // inventory system
  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  // no arguments
  if (args.length === 1) {
    description = `:arrow_double_up: ${message.member.displayName} 背包內可以使用的道具：\n`

    for (let id in userInventory.items) {
      if (usableKinds[items[id].kind]) {
        description += `\n${items[id].icon}**${items[id].displayName}**x${userInventory.items[id]}，\`87!use ${items[id].name}\``
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

  if (!userInventory.items[target.id]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
    return
  }

  if (target.amount > userInventory.items[target.id]) {
    target.amount = userInventory.items[target.id]
  }

  if (target.kind === 'buff') { // extend duration of buff
    let buffId = items[target.id].buffId

    if (!userInventory.buffs[buffId]) {
      userInventory.buffs[buffId] = message.createdTimestamp
    }
    userInventory.buffs[buffId] = userInventory.buffs[buffId] + items[target.id].duration * target.amount

    description = `:arrow_double_up: ${message.member.displayName} 使用了 ${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}`
  }

  // update database
  userInventory.items[target.id] -= target.amount
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  sendResponseMessage({ message, description })
}
