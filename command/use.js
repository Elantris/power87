const emoji = require('node-emoji')

const inventorySystem = require('../util/inventorySystem')
const buffs = require('../util/buffs')
const items = require('../util/items')

const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ args, client, database, fishing, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let target = {
    name: '',
    itemId: '',
    buffId: '',
    amount: 1,
    firstIndex: 0
  }

  // check target exists
  if (args[1]) {
    if (fishing[guildId] && fishing[guildId][userId]) {
      sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
      return
    }

    target.name = emoji.unemojify(args[1]).toLowerCase()
    for (let id in buffs) {
      if (target.name === buffs[id].name || target.name === buffs[id].icon || target.name === buffs[id].displayName) {
        target.buffId = id
        target.itemId = buffs[id].itemId
        if (args[2]) {
          target.amount = parseInt(args[2])
        }
        break
      }
    }

    if (!target.buffId) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }
  }

  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
      return
    }
    let userInventory = inventorySystem.parse(inventoryRaw)

    let itemsCount = {}
    userInventory.items.filter(item => items[item.id].kind === 'buff').forEach(item => {
      if (!itemsCount[item.id]) {
        itemsCount[item.id] = 0
      }
      itemsCount[item.id]++
    })

    // no arguments
    if (args.length === 1) {
      let description = `:arrow_double_up: ${message.member.displayName} 背包內可用的增益道具：\n`

      for (let itemId in itemsCount) {
        description += `\n${items[itemId].icon}**${items[itemId].displayName}**x${itemsCount[itemId]}，\`87!use ${items[itemId].name}\``
      }

      sendResponseMessage({ message, description })
      return
    }

    // user target
    if (!itemsCount[target.itemId]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
      return
    }

    if (target.amount > itemsCount[target.itemId]) {
      target.amount = itemsCount[target.itemId]
    }

    // remove items from bags
    userInventory.items.some((item, index) => {
      if (target.itemId === item.id) {
        target.firstIndex = index
        return true
      }
      return false
    })
    userInventory.items.splice(target.firstIndex, target.amount)

    // extend duration of buff
    if (!userInventory.buffs[target.buffId] || userInventory.buffs[target.buffId] < message.createdTimestamp) {
      userInventory.buffs[target.buffId] = message.createdTimestamp
    }
    userInventory.buffs[target.buffId] = parseInt(userInventory.buffs[target.buffId]) + buffs[target.buffId].duration * target.amount

    // update database
    database.ref(`/inventory/${guildId}/${userId}`).set(inventorySystem.make(userInventory).split(',').sort().join(','))

    // response
    let description = `:arrow_double_up: ${message.member.displayName} 使用了 ${buffs[target.buffId].icon}**${buffs[target.buffId].displayName}**x${target.amount}`
    sendResponseMessage({ message, description })
  })
}
