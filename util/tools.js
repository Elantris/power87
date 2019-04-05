module.exports = {
  $0: {
    name: 'bag',
    displayName: '隨身背包',
    description: '增加物品欄位，每提升一級解鎖 8 個欄位',
    icon: ':school_satchel:',
    maxLevel: 10,
    prices: [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400]
  },
  $1: {
    name: 'fishingpole',
    displayName: '釣竿',
    description: '購買後才能使用 fishing 指令釣魚，提升等級可以增加整體釣魚機率',
    icon: ':fishing_pole_and_fish:',
    maxLevel: 7,
    prices: [100, 300, 900, 2700, 8100, 24300, 72900, 218700]
  },
  $2: {
    name: 'sailboat',
    displayName: '帆船',
    description: '可以航行到更遠的地方去釣魚，提升等級以解鎖更多高價值的魚種、減少低價值魚種與垃圾出現的機率',
    icon: ':sailboat:',
    maxLevel: 3,
    prices: [100, 1000, 10000, 100000]
  },
  $3: {
    name: 'buoy',
    displayName: '浮標',
    description: '提升稀有魚種獲得機率',
    icon: ':trident:',
    maxLevel: 3,
    prices: [150, 450, 1350, 4050]
  }
}
