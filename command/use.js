const emoji = require('node-emoji')

const inventorySystem = require('../util/inventorySystem')
const buffs = require('../util/buffs')
const items = require('../util/items')

const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ args, client, database, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let target = {
    search: '',
    itemId: '',
    buffId: '',
    amount: 1,
    firstIndex: 0
  }

  // check target exists
  if (args[1]) {
    target.search = emoji.unemojify(args[1]).toLowerCase()
    for (let id in buffs) {
      let itemId = buffs[id].itemId
      if (target.search === items[itemId].name || target.search === items[itemId].icon || target.search === items[itemId].displayName) {
        target.buffId = id
        target.itemId = itemId
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

  // inventory system
  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ITEM' })
      return
    }
    let userInventory = inventorySystem.parse(inventoryRaw, message.createdTimestamp)

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

    database.ref(`/fishing/${guildId}/${userId}`).once('value').then(snapshot => {
      let fishingRaw = snapshot.val()
      if (fishingRaw) {
        sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
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
      database.ref(`/inventory/${guildId}/${userId}`).set(inventorySystem.make(userInventory, message.createdTimestamp))

      // response
      let description = `:arrow_double_up: ${message.member.displayName} 使用了 ${items[target.itemId].icon}**${items[target.itemId].displayName}**x${target.amount}`
      sendResponseMessage({ message, description })
    })
  })
}
