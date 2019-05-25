const chances = {
  '0': [0.0001, 0.0001, 0.0001, 0.0001, 0.0001],

  '1': [0.0001, 0.0002, 0.0003, 0.0004, 0.0005],
  '2': [0.0001, 0.0002, 0.0003, 0.0004, 0.0005],
  '3': [0.0002, 0.0003, 0.0004, 0.0005, 0.0006],
  '4': [0.0005, 0.0006, 0.0007, 0.0008, 0.0009],
  '5': [0.0008, 0.0009, 0.0010, 0.0011, 0.0012],
  '6': [0.0010, 0.0011, 0.0012, 0.0013, 0.0014],

  '7': [0.0000, 0.0000, 0.0000, 0.0000, 0.0100],
  '8': [0.0000, 0.0000, 0.0000, 0.0100, 0.0110],
  '9': [0.0000, 0.0000, 0.0100, 0.0110, 0.0120],
  '10': [0.0000, 0.0100, 0.0110, 0.0120, 0.0130],
  '11': [0.0100, 0.0110, 0.0120, 0.0130, 0.0140],

  '12': [0.0100, 0.0200, 0.0400, 0.0800, 0.5800],
  '13': [0.0200, 0.0400, 0.0800, 0.6100, 0.0100],
  '14': [0.0400, 0.0800, 0.6400, 0.0100, 0.0100],
  '15': [0.0800, 0.6700, 0.0100, 0.0100, 0.0100],
  '16': [0.7000, 0.0100, 0.0100, 0.0010, 0.0100]
}

const getLoot = ({ pool, multiplierNormal, multiplierRare }) => {
  let luck = Math.random()
  let multiplierTmp = 1

  for (let id in chances) {
    if (id === '1') {
      multiplierTmp = multiplierRare
    } else if (id === '7') {
      multiplierTmp = multiplierNormal
    }

    let weight = chances[id][pool] * multiplierTmp
    if (luck < weight) {
      return id
    }

    luck -= weight
  }

  return -1
}

module.exports = (userInventory, fishingRaw) => {
  if (userInventory.isFull) {
    return userInventory
  }

  let emptySlots = userInventory.maxSlots - userInventory.items.length

  let fishingPoleLevel = parseInt(userInventory.tools.$1)
  let multiplierNormal = 1 + fishingPoleLevel * 0.01 // fishing pole
  let multiplierRare = multiplierNormal
  let pool = 0
  if (userInventory.tools.$2) { // sailboat
    pool = 1 + parseInt(userInventory.tools.$2)
  }
  if (userInventory.tools.$3) { // buoy
    multiplierRare += 0.01 + parseInt(userInventory.tools.$3) * 0.01
  }

  let count = 0
  let counts = fishingRaw.split(';')[0].split(',').map(v => parseInt(v))

  count += counts[0] + counts[1]
  for (let i = 0; i < counts[0]; i++) { // fishing pole
    if (Math.random() < fishingPoleLevel * 0.05) {
      count++
    }
  }
  for (let i = 0; i < counts[1]; i++) { // buff
    if (Math.random() < fishingPoleLevel * 0.05 + 0.5) {
      count++
    }
  }

  for (let i = 0; i < count; i++) {
    if (emptySlots < 1) {
      break
    }

    let loot = getLoot({ pool, multiplierNormal, multiplierRare })
    if (loot === -1) {
      continue
    }

    userInventory.items.push({
      id: loot,
      amount: 1
    })
    emptySlots -= 1
  }

  if (emptySlots < 1) {
    userInventory.isFull = true
  }

  return userInventory
}
