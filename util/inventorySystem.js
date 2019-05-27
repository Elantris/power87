const items = require('./items')
const fishingSystem = require('./fishingSystem')

const read = async (database, guildId, userId, timenow = Date.now()) => {
  let inventoryRaw = await database.ref(`/inventory/${guildId}/${userId}`).once('value')

  let userInventory = {
    status: 'stay', // stay or fishing
    tools: {},
    buffs: {},
    items: {},
    maxSlots: 0,
    emptySlots: 0
  }

  if (!inventoryRaw.val()) {
    return userInventory
  }

  let inventoryData = inventoryRaw.val().split(',').filter(v => v)

  inventoryData.forEach(item => {
    if (item[0] === '$') { // tool, $id+level
      let tmp = item.split('+')
      userInventory.tools[tmp[0]] = tmp[1]

      if (tmp[0] === '$0') { // bag
        userInventory.maxSlots = userInventory.emptySlots = (parseInt(tmp[1]) + 1) * 8
      }
    } else if (item[0] === '%') { // buff, %id:timestamp
      let tmp = item.split(':')
      if (parseInt(tmp[1]) > timenow) {
        userInventory.buffs[tmp[0]] = parseInt(tmp[1])
      }
    } else { // item, id.amount
      let tmp = item.split('.')
      userInventory.items[tmp[0]] = userInventory.items[tmp[0]] || 0
      userInventory.items[tmp[0]] += parseInt(tmp[1] || 1)
      userInventory.emptySlots -= Math.ceil(parseInt(tmp[1] || 1) / items[tmp[0]].maxStack)
    }
  })

  // fishing system
  let fishingRaw = await database.ref(`/fishing/${guildId}/${userId}`).once('value')
  if (fishingRaw.exists()) {
    fishingSystem(userInventory, fishingRaw.val())

    if (userInventory.emptySlots > 0) {
      userInventory.status = 'fishing'
      await database.ref(`/fishing/${guildId}/${userId}`).set(`0,0;${userInventory.buffs['%0'] || ''}`)
    } else {
      userInventory.status = 'return'
      await database.ref(`/fishing/${guildId}/${userId}`).remove()
    }

    write(database, guildId, userId, userInventory, timenow)
  }

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

  for (let itemId in items) {
    if (userInventory.items[itemId]) {
      inventoryData.push(`${itemId}.${userInventory.items[itemId]}`)
    }
  }

  database.ref(`/inventory/${guildId}/${userId}`).set(inventoryData.join(','))
}

module.exports = {
  read,
  write
}
