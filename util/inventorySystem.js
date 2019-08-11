const tools = require('./tools')
const items = require('./items')
const buffs = require('./buffs')
const equipments = require('./equipments')
const fishingSystem = require('./fishingSystem')

const kindOrders = ['event', 'mark', 'hero', 'equipment', 'enhance', 'box', 'buff', 'petfood', 'jewel', 'fishing']
const kindNames = {
  box: '箱子道具',
  buff: '增益道具',
  enhance: '強化素材',
  equipment: '英雄裝備',
  event: '活動道具',
  fishing: '漁獲',
  hero: '英雄用品',
  jewel: '珠寶飾品',
  mark: '印章標記',
  petfood: '英雄食品'
}
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
  const userInventory = {
    status: 'stay', // stay or fishing
    tools: {},
    buffs: {},
    equipments: [],
    items: {},
    maxSlots: 0,
    emptySlots: 0,
    maxEquipments: 0
  }

  const inventoryRaw = await database.ref(`/inventory/${guildId}/${userId}`).once('value')
  if (!inventoryRaw.val()) {
    return userInventory
  }
  const inventoryData = inventoryRaw.val().split(',').filter(v => v)

  inventoryData.forEach(item => {
    let tmp

    if (item[0] === '!') { // status: !status
      userInventory.status = item.slice(1)
    } else if (item[0] === '$') { // tool: $id+level
      tmp = item.split('+')
      userInventory.tools[tmp[0]] = tmp[1]

      if (tmp[0] === '$0') { // bag
        userInventory.maxSlots += (parseInt(tmp[1]) + 1) * 8
        userInventory.emptySlots += (parseInt(tmp[1]) + 1) * 8
        userInventory.maxEquipments = parseInt(tmp[1])
      } else if (tmp[0] === '$2') { // sailboat
        userInventory.maxSlots += (parseInt(tmp[1]) + 1) * 4
        userInventory.emptySlots += (parseInt(tmp[1]) + 1) * 4
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
  if (userInventory.status === 'fishing') {
    const fishingRaw = await database.ref(`/fishing/${guildId}/${userId}`).once('value')
    if (fishingRaw.exists()) {
      fishingSystem(userInventory, fishingRaw.val())

      if (userInventory.emptySlots > 0) {
        userInventory.status = 'fishing'
        await database.ref(`/fishing/${guildId}/${userId}`).set(`0,0;${userInventory.buffs['%0'] || ''}`)
      } else {
        userInventory.status = 'stay'
        await database.ref(`/fishing/${guildId}/${userId}`).remove()
      }

      write(database, guildId, userId, userInventory, timenow)
    }
  }

  return userInventory
}

const write = (database, guildId, userId, userInventory, timenow = Date.now()) => {
  const inventoryData = []

  inventoryData.push(`!${userInventory.status}`)

  for (const id in tools) {
    if (userInventory.tools[id]) {
      inventoryData.push(`${id}+${userInventory.tools[id]}`)
    }
  }

  for (const id in buffs) {
    if (userInventory.buffs[id] && userInventory.buffs[id] > timenow) {
      inventoryData.push(`${id}:${userInventory.buffs[id]}`)
    }
  }

  userInventory.equipments.forEach(equipment => {
    inventoryData.push(`&${equipment.id.toString().padStart(4, '0')}+${equipment.level}`)
  })

  for (const id in items) {
    if (userInventory.items[id]) {
      inventoryData.push(`${id}.${userInventory.items[id]}`)
    }
  }

  database.ref(`/inventory/${guildId}/${userId}`).set(inventoryData.join(','))
}

const exchangeEquipment = (userInventory, kind, quality) => {
  if (!equipmentMapping[kind][quality]) {
    return 'ERROR_NOT_FOUND'
  }

  const luck = Math.floor(Math.random() * equipmentMapping[kind][quality].length)
  userInventory.equipments.push({
    id: equipmentMapping[kind][quality][luck],
    level: 0
  })
}

const parseEquipment = (raw) => {
  raw = raw.split('+')
  return {
    id: parseInt(raw[0].slice(1)),
    level: parseInt(raw[1] || 0)
  }
}

const findEquipmentIndex = (userInventory, search) => {
  search = search.split('+')

  return userInventory.equipments.findIndex((v, index) => {
    if (search[0] === equipments[v.id].name && parseInt(search[1]) === v.level) {
      return true
    }
    return false
  })
}

const calculateAbility = (id, level) => equipments[id].blank.map((v, i) => v + equipments[id].levelUp[i] * level)

module.exports = {
  // properties
  kindOrders,
  kindNames,
  enhanceChances,

  // methods
  read,
  write,
  exchangeEquipment,
  parseEquipment,
  findEquipmentIndex,
  calculateAbility
}
