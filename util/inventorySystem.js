let fishingSystem = require('./fishingSystem')

const sortItems = (userInventory) => {
  userInventory.items = userInventory.items.sort((itemA, itemB) => {
    if (itemA.kind < itemB.kind) {
      return -1
    }
    if (itemA.kind > itemB.kind) {
      return 1
    }

    return parseInt(itemA.id) - parseInt(itemB.id)
  })
}

const removeItems = (userInventory, itemId, amount = 1) => {
  let firstIndex = -1

  userInventory.items.some((item, index) => {
    if (item.id === itemId) {
      firstIndex = index
      return true
    }
    return false
  })

  if (firstIndex !== -1) {
    userInventory.items.splice(firstIndex, amount)
  }
}

const read = async (database, guildId, userId, timenow = Date.now()) => {
  let inventoryRaw = await database.ref(`/inventory/${guildId}/${userId}`).once('value')

  let userInventory = {
    status: 'stay', // stay or fishing
    tools: {},
    buffs: {},
    items: [],
    maxSlots: 0,
    isFull: false
  }

  if (!inventoryRaw.val()) {
    return userInventory
  }

  let inventoryData = inventoryRaw.val().split(',').filter(v => v)

  inventoryData.forEach(item => {
    if (item[0] === '$') { // tool
      let tmp = item.split('+') // $id+level
      userInventory.tools[tmp[0]] = tmp[1]
      if (tmp[0] === '$0') {
        userInventory.maxSlots = (parseInt(tmp[1]) + 1) * 8
      }
    } else if (item[0] === '%') { // buff
      let tmp = item.split(':') // %id:timestamp
      if (parseInt(tmp[1]) > timenow) {
        userInventory.buffs[tmp[0]] = parseInt(tmp[1])
      }
    } else { // item
      let tmp = item.split('.') // id.amount
      userInventory.items.push({
        id: tmp[0],
        amount: parseInt(tmp[1] || 1)
      })
    }
  })

  if (userInventory.items.length >= userInventory.maxSlots) {
    userInventory.isFull = true
  }

  // fishing system
  let fishingRaw = await database.ref(`/fishing/${guildId}/${userId}`).once('value')
  if (fishingRaw.exists()) {
    fishingSystem(userInventory, fishingRaw.val())

    if (userInventory.isFull) {
      userInventory.status = 'return'
      await database.ref(`/fishing/${guildId}/${userId}`).remove()
    } else {
      userInventory.status = 'fishing'
      await database.ref(`/fishing/${guildId}/${userId}`).set(`0,0;${userInventory.buffs['%0'] || ''}`)
    }

    write(database, guildId, userId, userInventory, timenow)
  }

  sortItems(userInventory)

  return userInventory
}

const write = (database, guildId, userId, userInventory, timenow = Date.now()) => {
  let inventoryData = []
  for (let toolId in userInventory.tools) {
    inventoryData.push(`${toolId}+${userInventory.tools[toolId]}`)
  }

  for (let id in userInventory.buffs) {
    if (userInventory.buffs[id] > timenow) {
      inventoryData.push(`${id}:${userInventory.buffs[id]}`)
    }
  }

  userInventory.items.forEach(item => {
    let tmpAmount = ''
    if (item.amount > 1) {
      tmpAmount = '.' + item.amount
    }
    inventoryData.push(`${item.id}${tmpAmount}`)
  })

  database.ref(`/inventory/${guildId}/${userId}`).set(inventoryData.join(','))
}

module.exports = {
  read,
  write,
  sortItems,
  removeItems
}
