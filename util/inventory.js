const parseInventory = inventoryRaw => {
  let inventoryData = inventoryRaw.split(',').filter(v => v)
  let userInventory = {
    tools: {},
    items: [],
    maxSlots: 0,
    hasEmptySlot: false
  }

  inventoryData.forEach(item => {
    if (item.includes('$')) {
      let tmp = item.split('+') // $id+level
      userInventory.tools[tmp[0]] = tmp[1]
      if (tmp[0] === '$0') {
        userInventory.maxSlots = (parseInt(tmp[1]) + 1) * 8
      }
    } else {
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

const makeInventory = userInventory => {
  let inventoryData = []
  for (let i in userInventory.tools) {
    inventoryData.push(`${i}+${userInventory.tools[i]}`)
  }

  userInventory.items.forEach(item => {
    let tmpAmount = ''
    if (item.amount > 1) {
      tmpAmount = '.' + item.amount
    }
    inventoryData.push(`${item.id}${tmpAmount}`)
  })

  return inventoryData.join(',')
}

module.exports = {
  parseInventory,
  makeInventory
}
