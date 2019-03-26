const tools = {
  $Bag: {
    icon: ':school_satchel:',
    name: '隨身背包',
    description: '購買後可增加背包欄位數量，每升一級多 8 格空位',
    maxLevel: 10,
    prices: [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400]
  },
  $FishingPole: {
    icon: ':fishing_pole_and_fish:',
    name: '釣竿',
    description: '購買後可以使用 fish 指令釣魚',
    maxLevel: 0,
    prices: [100]
  }
}

const items = [{ icon: 'gem', weight: 1, value: 1000 }, { icon: 'whale', weight: 3, value: 500 }, { icon: 'shark', weight: 5, value: 200 }, { icon: 'dolphin', weight: 7, value: 100 }, { icon: 'turtle', weight: 14, value: 50 }, { icon: 'octopus', weight: 20, value: 20 }, { icon: 'squid', weight: 50, value: 10 }, { icon: 'blowfish', weight: 100, value: 5 }, { icon: 'shrimp', weight: 150, value: 2 }, { icon: 'fish', weight: 250, value: 1 }, { icon: 'trash', weight: 400, value: 0 }]

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
      let tmp = item.split('+') // $name+level
      userInventory.tools[tmp[0]] = tmp[1]
      if (tmp[0] === '$Bag') {
        userInventory.maxSlots = (parseInt(tmp[1]) + 1) * 8
      }
    } else {
      let tmp = item.split('.') // icon.amount,icon.amount
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
    inventoryData.push(`${item.id}.${item.amount || 1}`)
  })

  return inventoryData.sort().join(',')
}

module.exports = {
  tools,
  items,
  parseInventory,
  makeInventory
}
