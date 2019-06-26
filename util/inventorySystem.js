const tools = require('./tools')
const items = require('./items')
const buffs = require('./buffs')
const equipments = require('./equipments')
const fishingSystem = require('./fishingSystem')

const kindOrders = ['event', 'mark', 'hero', 'equipment', 'enhance', 'box', 'buff', 'petfood', 'jewel', 'fishing']
const equipmentMapping = {
  weapon: {
    base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  armor: {
    base: [1000, 1001, 1002]
  }
}
const enhanceChances = {
  base: [0.8, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.08, 0.05, 0.03]
}

const read = async (database, guildId, userId, timenow = Date.now()) => {
  let userInventory = {
    status: 'stay', // stay or fishing
    tools: {},
    buffs: {},
    equipments: [],
    items: {},
    maxSlots: 0,
    emptySlots: 0
  }

  let inventoryRaw = await database.ref(`/inventory/${guildId}/${userId}`).once('value')
  if (!inventoryRaw.val()) {
    return userInventory
  }
  let inventoryData = inventoryRaw.val().split(',').filter(v => v)

  inventoryData.forEach(item => {
    let tmp
    if (item[0] === '$') { // tool: $id+level
      tmp = item.split('+')
      userInventory.tools[tmp[0]] = tmp[1]

      if (tmp[0] === '$0') { // bag
        userInventory.maxSlots = userInventory.emptySlots = (parseInt(tmp[1]) + 1) * 8
      }
    } else if (item[0] === '%') { // buff: %id:timestamp
      tmp = item.split(':')
      if (parseInt(tmp[1]) > timenow) {
        userInventory.buffs[tmp[0]] = parseInt(tmp[1])
      }
    } else if (item[0] === '&') { // equipment: &id+level
      tmp = item.split('+')
      userInventory.equipments.push({
        id: parseInt(tmp[0].slice(1)),
        level: parseInt(tmp[1] || 0)
      })
    } else { // item: id.amount
      tmp = item.split('.')
      if (!userInventory.items[tmp[0]]) {
        userInventory.items[tmp[0]] = 0
      }
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

  for (let id in tools) {
    if (userInventory.tools[id]) {
      inventoryData.push(`${id}+${userInventory.tools[id]}`)
    }
  }

  for (let id in buffs) {
    if (userInventory.buffs[id] && userInventory.buffs[id] > timenow) {
      inventoryData.push(`${id}:${userInventory.buffs[id]}`)
    }
  }

  userInventory.equipments.forEach(equipment => {
    inventoryData.push(`&${equipment.id.toString().padStart(4, '0')}+${equipment.level}`)
  })

  for (let id in items) {
    if (userInventory.items[id]) {
      inventoryData.push(`${id}.${userInventory.items[id]}`)
    }
  }

  database.ref(`/inventory/${guildId}/${userId}`).set(inventoryData.join(','))
}

const getEquipment = (userInventory, kind, quality) => {
  if (!equipmentMapping[kind][quality]) {
    return 'ERROR_NOT_FOUND'
  }

  let luck = Math.floor(Math.random() * equipmentMapping[kind][quality].length)
  userInventory.equipments.push({
    id: equipmentMapping[kind][quality][luck],
    level: 0
  })
}

const calculateAbility = (id, level) => equipments[id].blank.map((v, i) => v + equipments[id].levelUp[i] * level)

module.exports = {
  // properties
  kindOrders,
  enhanceChances,

  // methods
  read,
  write,
  getEquipment,
  calculateAbility
}
