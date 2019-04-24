const parse = (inventoryRaw, timenow = Date.now()) => {
  let inventoryData = inventoryRaw.split(',').filter(v => v)
  let userInventory = {
    tools: {},
    buffs: {},
    items: [],
    maxSlots: 0,
    hasEmptySlot: false
  }

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

  return userInventory
}

const make = (userInventory, timenow = Date.now()) => {
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

  return inventoryData.sort().join(',')
}

module.exports = {
  parse,
  make
}
