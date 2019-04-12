const emoji = require('node-emoji')
const energy = require('../util/energy')
const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const tools = require('../util/tools')
const items = require('../util/items')

module.exports = ({ args, database, fishing, message, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let target = {
    name: '',
    id: '',
    type: '',
    level: 0,
    price: 0,
    amount: 1
  }

  // user target
  if (args[1]) {
    if (fishing[guildId] && typeof fishing[guildId][userId] === 'number') {
      sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
      return
    }

    target.name = emoji.unemojify(args[1]).toLowerCase()

    for (let id in tools) {
      if (target.name === tools[id].name || target.name === tools[id].icon || target.name === tools[id].displayName) {
        target.id = id
        target.type = 'tool'
        target.price = tools[id].prices[0]
        break
      }
    }

    for (let id in items) {
      if (target.type) {
        break
      }
      if (!items[id].price) {
        continue
      }

      if (target.name === items[id].name || target.name === items[id].icon || target.name === items[id].displayName) {
        target.id = id
        target.type = 'item'
        target.price = items[id].price
        if (args[2]) {
          target.amount = parseInt(args[2])
        }
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
          if (toolLevel > tools[id].maxLevel) {
            continue
          }
        }

        description += `\n${tools[id].icon}**${tools[id].displayName}**+${toolLevel}，:battery: **${tools[id].prices[toolLevel]}**，\`87!buy ${tools[id].name}\``
      }

      description += `\n\n__特色商品__：`

      for (let id in items) {
        if (items[id].price) {
          description += `\n${items[id].icon}**${items[id].displayName}**，:battery: **${items[id].price}**，\`87!buy ${items[id].name}\``
        }
      }

      sendResponseMessage({ message, description })
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
      if (!userInventory.hasEmptySlot) {
        sendResponseMessage({ message, errorCode: 'ERROR_BAG_FULL' })
        return
      }
      if (userInventory.items.length + target.amount > userInventory.maxSlots) {
        sendResponseMessage({ message, errorCode: 'ERROR_BAG_FULL' })
        return
      }
    }

    // energy system
    database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energy.INITIAL_USER_ENERGY
        database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      }

      let energyCost = target.price * target.amount
      if (userEnergy < energyCost) {
        sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
        return
      }

      userEnergy -= energyCost
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)

      let updates = ''
      if (target.type === 'tool') {
        userInventory.tools[target.id] = target.level
        updates = inventory.makeInventory(userInventory)
      } else if (target.type === 'item') {
        updates = inventoryRaw + `,${target.id}`.repeat(target.amount)
      }
      updates = updates.split(',').sort().join(',')
      database.ref(`/inventory/${guildId}/${userId}`).set(updates)

      // response
      let description = `:shopping_cart: ${message.member.displayName} 消耗了 ${energyCost} 點八七能量，購買了 `
      if (target.type === 'tool') {
        description += `${tools[target.id].icon}**${tools[target.id].displayName}**+${target.level}`
      } else if (target.type === 'item') {
        description += `${items[target.id].icon}**${items[target.id].displayName}**x${target.amount}`
      }

      sendResponseMessage({ message, description })
    })
  })
}
