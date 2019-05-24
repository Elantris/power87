const parse = (inventoryRaw = '', timenow = Date.now()) => {
  let userInventory = {
    tools: {},
    buffs: {},
    items: [],
    maxSlots: 0,
    hasEmptySlot: false
  }

  if (!inventoryRaw) {
    return userInventory
  }

  let inventoryData = inventoryRaw.split(',').filter(v => v)

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

  if (userInventory.items.length < userInventory.maxSlots) {
    userInventory.hasEmptySlot = true
  }

  sortItems(userInventory)

  return userInventory
}

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

  return parse(inventoryRaw.val() || '', timenow)
}

const set = (database, guildId, userId, userInventory, timenow = Date.now()) => {
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
  parse,
  sortItems,
  removeItems,
  read,
  set
}
