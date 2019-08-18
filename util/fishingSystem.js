const chances = {
  16: [0.7000, 0.0100, 0.0100, 0.0100, 0.0100],
  15: [0.0800, 0.6600, 0.0100, 0.0100, 0.0100],
  14: [0.0400, 0.0800, 0.6200, 0.0100, 0.0100],
  13: [0.0200, 0.0400, 0.0800, 0.5800, 0.0100],
  12: [0.0100, 0.0200, 0.0400, 0.0800, 0.5400],

  11: [0.0060, 0.0120, 0.0180, 0.0240, 0.0300],
  10: [0.0050, 0.0100, 0.0150, 0.0200, 0.0250],
  9: [0.0040, 0.0080, 0.0120, 0.0160, 0.0200],
  8: [0.0030, 0.0060, 0.0090, 0.0120, 0.0150],
  7: [0.0020, 0.0040, 0.0060, 0.0080, 0.0100],

  6: [0.0008, 0.0010, 0.0012, 0.0014, 0.0016],
  5: [0.0005, 0.0007, 0.0009, 0.0011, 0.0013],
  4: [0.0003, 0.0005, 0.0007, 0.0009, 0.0011],
  3: [0.0002, 0.0004, 0.0006, 0.0008, 0.0010],
  2: [0.0001, 0.0003, 0.0005, 0.0006, 0.0008],
  1: [0.0001, 0.0003, 0.0005, 0.0006, 0.0008],

  0: [0.0001, 0.0001, 0.0002, 0.0002, 0.0003]
}

const getLoot = ({ pool, multiplierNormal, multiplierRare }) => {
  let luck = Math.random()

  for (const id in chances) {
    let weight = chances[id][pool]
    if (id > 6) {
      weight *= multiplierNormal
    } else if (id > 0) {
      weight *= multiplierRare
    }

    if (luck < weight) {
      return id
    }
    luck -= weight
  }

  return -1
}

module.exports = (userInventory, fishingRaw) => {
  if (userInventory.emptySlots <= 0) {
    return userInventory
  }

  const fishingPoleLevel = parseInt(userInventory.tools.$1)
  const sailboatLevel = parseInt(userInventory.tools.$2 || -1)
  const buoyLevel = parseInt(userInventory.tools.$3 || -1)

  const multiplierNormal = 1 + fishingPoleLevel * 0.01
  const multiplierRare = multiplierNormal + (buoyLevel + 1) * 0.01
  const pool = sailboatLevel + 1

  const counts = fishingRaw
    .split(';')[0]
    .split(',')
    .map(v => parseInt(v))

  let count = counts[0] + counts[1]
  for (let i = 0; i < counts[0]; i++) {
    if (Math.random() < fishingPoleLevel * 0.05) {
      count++
    }
  }
  for (let i = 0; i < counts[1]; i++) {
    count += Math.floor(Math.random() * 2) // buff effects
  }

  for (let i = 0; i < count && userInventory.emptySlots > 0; i++) {
    const loot = getLoot({ pool, multiplierNormal, multiplierRare })
    if (loot === -1) {
      continue
    }

    if (!userInventory.items[loot]) {
      userInventory.items[loot] = 0
    }

    userInventory.items[loot] += 1
    userInventory.emptySlots -= 1
  }

  return userInventory
}
