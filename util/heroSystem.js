const config = require('../config')

const species = ['ant', 'baby_chick', 'bat', 'bear', 'bee', 'beetle', 'bird', 'blowfish', 'boar', 'bug', 'butterfly', 'camel', 'cat', 'cat2', 'chicken', 'chipmunk', 'cow', 'cow2', 'crab', 'crocodile', 'deer', 'dog', 'dog2', 'dolphin', 'dove', 'dragon', 'dragon_face', 'dromedary_camel', 'duck', 'eagle', 'elephant', 'feet', 'fish', 'fox', 'frog', 'goat', 'gorilla', 'hamster', 'horse', 'jack_o_lantern', 'koala', 'leopard', 'lion_face', 'lizard', 'monkey_face', 'mouse', 'mouse2', 'octopus', 'owl', 'ox', 'panda_face', 'penguin', 'pig', 'pig2', 'poodle', 'rabbit', 'rabbit2', 'racehorse', 'ram', 'rat', 'rhino', 'rooster', 'scorpion', 'shark', 'sheep', 'shrimp', 'snail', 'snake', 'snowman', 'spider', 'squid', 'tiger', 'tiger2', 'tropical_fish', 'turkey', 'turtle', 'unicorn', 'water_buffalo', 'whale', 'whale2', 'wolf']
const expRange = [0, 100, 210, 331, 464, 610, 770, 946, 1139, 1351, 1584, 1840, 2121, 2430, 2769, 3141, 3550, 3999, 4492, 5034, 5630, 6285, 7005, 7797, 8668, 9626, 10679, 11837, 13110, 14510, 16050, 17744, 19607, 21656, 23909, 26387, 29112, 32109, 35405, 39030, 43017, 47402, 52225, 57530, 63365, 69783, 76842, 84606, 93146, 102540, 112873, 999999]

// 0 name ; 1 species ; 2 rarity ; 3 exp ; 4 feed ; 5 timeGap:status
// MyPet ; snowman ; 4 ; 200 ; 100 ; 432800:stay
// MyPet ; snowman ; 4 ; 200 ; 100 ; 432800:work:432840 // 1 hr
const parse = (heroRaw, timenow = Date.now()) => {
  let timeGap = Math.floor(timenow / config.tick)

  let userHero = {
    name: '',
    species: '',
    rarity: '',
    exp: 0,
    feed: 100,
    lastUpdate: 0,

    // calculated
    level: 0,
    expPercent: 0,
    maxFeed: 100,
    feedPercent: 0,
    status: '',
    statusDisplay: ''
  }

  let heroData = heroRaw.split(';')
  userHero.name = heroData[0]
  userHero.species = heroData[1]
  userHero.rarity = parseInt(heroData[2])
  userHero.exp = parseInt(heroData[3])
  userHero.feed = parseInt(heroData[4])
  userHero.lastUpdate = parseInt(heroData[5])

  for (let level in expRange) {
    if (level > userHero.rarity * 10) {
      userHero.level = userHero.rarity * 10
      userHero.exp = expRange[level - 1] - 1
      break
    } else if (userHero.exp < expRange[level]) {
      userHero.level = parseInt(level)
      break
    }
  }
  userHero.expPercent = ((userHero.exp - expRange[userHero.level - 1]) * 100 / (expRange[userHero.level] - expRange[userHero.level - 1])).toFixed(2)

  userHero.maxFeed = 98 + userHero.level * 2
  userHero.feed -= timeGap - userHero.lastUpdate

  if (userHero.feed < -1200 - userHero.level * 120) { // starving than 5 days
    userHero.status = 'dead'
  } else if (userHero.feed < -240) {
    userHero.status = 'starve'
  } else if (userHero.feed < 0) {
    userHero.status = 'hungry'
  } else {
    userHero.feedPercent = (userHero.feed * 100 / userHero.maxFeed).toFixed(2)
    userHero.status = 'stay'
  }

  userHero.lastUpdate = timeGap

  return userHero
}

const make = (userHero, timenow = Date.now()) => {
  userHero.lastUpdate = Math.floor(timenow / config.tick)
  let heroRaw = `${userHero.name};${userHero.species};${userHero.rarity};${userHero.exp};${userHero.feed};${userHero.lastUpdate}:${userHero.status}`
  return heroRaw
}

const rarityDisplay = (rarity) => ':star:'.repeat(parseInt(rarity))

const statusMapping = {
  starve: ['極度飢餓', '餓昏頭', '長期饑餓', '找不到東西吃', '需要主人的關愛'],
  hungry: ['肚子餓了', '想吃東西', '肚子還有點餓', '快給我吃的', '給我...吃...的...'],
  stay: ['閒置', '發呆', '空閑', '無聊', '站著', '坐著', '躺著'],
  work: ['工作中', '賣命工作中', '勤奮工作中', '為了錢工作中', '為了食物工作中']
}
const statusDisplay = (status) => {
  if (!statusMapping[status]) {
    return status
  }

  return statusMapping[status][Math.floor(Math.random() * statusMapping[status].length)]
}

module.exports = {
  species,
  parse,
  make,
  rarityDisplay,
  statusDisplay
}
