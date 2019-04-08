const emoji = require('node-emoji')
const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const items = require('../util/items')
const buffs = require('../util/buffs')

module.exports = ({ args, client, database, fishing, message, guildId, userId }) => {
  if (fishing[guildId] && fishing[guildId][userId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  let target = {
    itemId: '',
    buffId: '',
    name: '',
    firstIndex: 0
  }

  if (args[1]) {
    // check exists
    target.name = emoji.unemojify(args[1]).toLowerCase()
    for (let buffId in buffs) {
      if (target.name === buffs[buffId].name || target.name === buffs[buffId].icon || target.name === buffs[buffId].displayName) {
        target.buffId = buffId
        target.itemId = buffs[buffId].itemId
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
    let userInventory = inventory.parseInventory(inventoryRaw)
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
        description += `\n${items[itemId].icon} ${items[itemId].displayName}x${itemsCount[itemId]}`
      }

      sendResponseMessage({ message, description })
      return
    }

    // user choice
    if (!itemsCount[target.itemId]) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
      return
    }

    userInventory.items.some((item, index) => {
      if (target.itemId === item.id) {
        target.firstIndex = index
        return true
      }
      return false
    })
    userInventory.items.splice(target.firstIndex, 1)

    if (!userInventory.buffs[target.buffId] || userInventory.buffs[target.buffId] < message.createdTimestamp) {
      userInventory.buffs[target.buffId] = message.createdTimestamp
    }
    userInventory.buffs[target.buffId] = parseInt(userInventory.buffs[target.buffId]) + buffs[target.buffId].duration

    let updates = inventory.makeInventory(userInventory)
    updates = updates.split(',').sort().join(',')
    database.ref(`/inventory/${guildId}/${userId}`).set(updates)

    // response
    let description = `:arrow_double_up: ${message.member.displayName} 使用了 ${buffs[target.buffId].icon} ${buffs[target.buffId].displayName}`
    sendResponseMessage({ message, description })
  })
}
