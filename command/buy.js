const emoji = require('node-emoji')

const energySystem = require('../util/energySystem')
const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ args, database, message, fishing, guildId, userId }) => {
  if (args[2] && (!Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1)) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let target = {
    search: '',
    id: '',
    type: '',
    level: 0,
    price: 0,
    amount: 1
  }

  // check target exists
  if (args[1]) {
    if (fishing[guildId] && fishing[guildId][userId]) {
      sendResponseMessage({ message, errorCode: 'ERROR_IS_FISHING' })
      return
    }
    target.search = emoji.unemojify(args[1]).toLowerCase()

    for (let id in tools) {
      if (target.search === tools[id].name || target.search === tools[id].icon || target.search === tools[id].displayName) {
        target.id = id
        target.type = 'tool'
        target.price = tools[id].prices[0]
        break
      }
    }

    for (let id in items) {
      if (target.id) {
        break
      }
      if (!items[id].price) {
        continue
      }

      if (target.search === items[id].name || target.search === items[id].icon || target.search === items[id].displayName) {
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
    let userInventory = inventorySystem.parse(inventoryRaw)

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
      if (!userInventory.hasEmptySlot || userInventory.items.length + target.amount > userInventory.maxSlots) {
        sendResponseMessage({ message, errorCode: 'ERROR_BAG_FULL' })
        return
      }
    }

    // energy system
    database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
      let userEnergy = snapshot.val()
      if (!snapshot.exists()) {
        userEnergy = energySystem.INITIAL_USER_ENERGY
        database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      }

      let energyCost = target.price * target.amount
      if (userEnergy < energyCost) {
        sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
        return
      }

      // update database
      let updates = ''
      if (target.type === 'tool') {
        userInventory.tools[target.id] = target.level
        updates = inventorySystem.makeInventory(userInventory)
      } else if (target.type === 'item') {
        updates = inventoryRaw + `,${target.id}`.repeat(target.amount)
      }

      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
      database.ref(`/inventory/${guildId}/${userId}`).set(updates.split(',').sort().join(','))

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
