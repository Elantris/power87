const emoji = require('node-emoji')
const energy = require('../util/energy')
const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const tools = require('../util/tools')
const items = require('../util/items')

module.exports = ({ args, database, fishing, message, guildId, userId }) => {
  if (fishing[guildId] && fishing[guildId][userId]) {
    sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
    return
  }

  let target = {
    id: '',
    type: '',
    name: '',
    level: 0,
    price: 0
  }

  // user choice
  if (args[1]) {
    target.name = emoji.unemojify(args[1]).toLowerCase()

    for (let id in tools) {
      if (target.name === tools[id].name || target.name === tools[id].icon || target.name === tools[id].displayName) {
        target.id = id
        target.type = 'tool'
        break
      }
    }

    for (let id in items) {
      if (!items[id].price) {
        continue
      }

      if (target.name === items[id].name || target.name === items[id].icon || target.name === items[id].displayName) {
        target.id = id
        target.type = 'item'
        target.price = items[id].price
        break
      }
    }

    if (!target.id) {
      sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
      return
    }
  }

  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    // no arguments
    if (args.length === 1) {
      let description = `:shopping_cart: ${message.member.displayName} 可購買的商品：\n\n__裝備道具__：`

      for (let id in tools) {
        let toolLevel = 0
        if (userInventory.tools[id]) {
          toolLevel = parseInt(userInventory.tools[id]) + 1
        }

        if (toolLevel <= tools[id].maxLevel) {
          description += `\n${tools[id].icon} **${tools[id].displayName}**+${toolLevel}，:battery: **${tools[id].prices[toolLevel]}**，\`87!buy ${tools[id].name}\``
        }
      }

      description += `\n\n__增益效果__：`

      for (let id in items) {
        if (items[id].price) {
          description += `\n${items[id].icon} **${items[id].displayName}**，:battery: **${items[id].price}**，\`87!buy ${items[id].name}\``
        }
      }

      sendResponseMessage({ message, description })
      return
    }

    // check tool level
    if (target.type === 'tool' && userInventory.tools[target.id]) {
      target.level = parseInt(userInventory.tools[target.id]) + 1
      if (target.level > tools[target.id].maxLevel) {
        sendResponseMessage({ message, errorCode: 'ERROR_MAX_LEVEL' })
        return
      }
      target.price = tools[target.id].prices[target.level]
    }

    // energy system
    database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energy.INITIAL_USER_ENERGY
        database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      }

      let energyCost = target.price
      if (userEnergy < energyCost) {
        sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
        return
      }

      if (target.type === 'item' && !userInventory.hasEmptySlot) {
        sendResponseMessage({ message, errorCode: 'ERROR_FULL_BAG' })
        return
      }

      userEnergy -= energyCost
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      if (target.type === 'tool') {
        userInventory.tools[target.id] = target.level
      } else if (target.type === 'item') {
        userInventory.items.push({
          id: target.id,
          amount: 1
        })
      }

      let updates = inventory.makeInventory(userInventory)
      updates = updates.split(',').sort().join(',')
      database.ref(`/inventory/${guildId}/${userId}`).set(updates)

      // response
      let description = `:shopping_cart: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，成功購買 `
      if (target.type === 'tool') {
        description += `${tools[target.id].icon} **${tools[target.id].displayName}** +${target.level}`
      } else if (target.type === 'item') {
        description += `${items[target.id].icon} **${items[target.id].displayName}**`
      }

      sendResponseMessage({ message, description })
    })
  })
}
