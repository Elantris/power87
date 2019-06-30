const config = require('../config')
const equipments = require('./equipments')
const inventorySystem = require('./inventorySystem')

// * properties
const species = ['ant', 'baby_chick', 'bat', 'bear', 'bee', 'beetle', 'bird', 'blowfish', 'boar', 'bug', 'butterfly', 'camel', 'cat', 'cat2', 'chicken', 'chipmunk', 'cow', 'cow2', 'crab', 'crocodile', 'deer', 'dog', 'dog2', 'dolphin', 'dove', 'dragon', 'dragon_face', 'dromedary_camel', 'duck', 'eagle', 'elephant', 'feet', 'fish', 'fox', 'frog', 'goat', 'gorilla', 'hamster', 'horse', 'jack_o_lantern', 'koala', 'leopard', 'lion_face', 'lizard', 'monkey_face', 'mouse', 'mouse2', 'octopus', 'owl', 'ox', 'panda_face', 'penguin', 'pig', 'pig2', 'poodle', 'rabbit', 'rabbit2', 'racehorse', 'ram', 'rat', 'rhino', 'rooster', 'scorpion', 'shark', 'sheep', 'shrimp', 'snail', 'snake', 'snowman', 'spider', 'squid', 'tiger', 'tiger2', 'tropical_fish', 'turkey', 'turtle', 'unicorn', 'water_buffalo', 'whale', 'whale2', 'wolf']
const expRange = [0, 100, 210, 331, 464, 610, 770, 946, 1139, 1351, 1584, 1840, 2121, 2430, 2769, 3141, 3550, 3999, 4492, 5034, 5630, 6285, 7005, 7797, 8668, 9626, 10679, 11837, 13110, 14510, 16050, 17744, 19607, 21656, 23909, 26387, 29112, 32109, 35405, 39030, 43017, 47402, 52225, 57530, 63365, 69783, 76842, 84606, 93146, 102540, 112873, 9999999]

// 0 lastUpdate : timeGap
// 1 name : string
// 2 species : string
// 3 rarity : number
// 4 experience : number
// 5 feed : number
// 6 ability : array (number)
// 7 equipment: array (string)
// 8 status : string

// * methods
const read = async (database, guildId, userId, timenow = Date.now()) => {
  let heroRaw = await database.ref(`/hero/${guildId}/${userId}`).once('value')
  if (!heroRaw.exists()) {
    return {}
  }

  let timeGap = Math.floor(timenow / config.tick)
  let userHero = {
    lastUpdate: 0,

    // basic
    name: '',
    species: '',
    rarity: '',
    exp: 0,
    feed: 100,
    str: 0,
    vit: 0,
    agi: 0,
    int: 0,
    luk: 0,
    weapon: null,
    armor: null,

    // calculated
    level: 0,
    expPercent: 0,
    maxFeed: 100,
    feedPercent: 0,
    atk: 1,
    def: 1,
    hit: 1,
    ev: 1,
    spd: 1,
    status: ''
  }

  let heroData = heroRaw.val().split(';')
  userHero.lastUpdate = parseInt(heroData[0])
  userHero.name = heroData[1]
  userHero.species = heroData[2]
  userHero.rarity = parseInt(heroData[3])
  userHero.exp = parseInt(heroData[4])
  userHero.feed = parseInt(heroData[5])

  let ability = heroData[6].split(',').map(v => parseInt(v))
  userHero.str = ability[0]
  userHero.vit = ability[1]
  userHero.agi = ability[2]
  userHero.int = ability[3]
  userHero.luk = ability[4]

  // equipment
  heroData[7].split(',').filter(v => v).forEach(v => {
    let tmp = v.slice(1).split('+').map(v => parseInt(v))
    userHero[equipments[tmp[0]].kind] = {
      id: tmp[0],
      level: parseInt(tmp[1])
    }

    let abilities = inventorySystem.calculateAbility(tmp[0], tmp[1])
    if (equipments[tmp[0]].kind === 'weapon') {
      userHero.atk += abilities[0]
      userHero.hit += abilities[1]
      userHero.spd += abilities[2]
    } else if (equipments[tmp[0]].kind === 'armor') {
      userHero.def += abilities[0]
      userHero.ev += abilities[1]
      userHero.spd += abilities[2]
    }
  })

  userHero.status = heroData[8]

  // level
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

  // feed
  userHero.maxFeed = 98 + userHero.level * 2
  userHero.feed -= timeGap - userHero.lastUpdate

  if (userHero.feed > 0) {
    userHero.feedPercent = (userHero.feed * 100 / userHero.maxFeed).toFixed(2)
    userHero.status = 'stay'
  } else if (userHero.feed > -240) {
    userHero.status = 'hungry'
  } else if (userHero.feed > -1200 - userHero.level * 120) {
    userHero.status = 'starve'
  } else { // starving than 5 days
    userHero.status = 'dead'
  }

  // meta
  userHero.lastUpdate = timeGap

  return userHero
}

const write = (database, guildId, userId, userHero, timenow = Date.now()) => {
  userHero.lastUpdate = parseInt(timenow / config.tick)

  let ability = `${userHero.str},${userHero.vit},${userHero.agi},${userHero.int},${userHero.luk}`

  let equipment = []
  if (userHero.weapon) {
    equipment.push(userHero.weapon)
  }
  if (userHero.armor) {
    equipment.push(userHero.armor)
  }
  equipment = equipment.map(v => `&${v.id.toString().padStart(4, '0')}+${v.level}`).join(',')

  database.ref(`/hero/${guildId}/${userId}`).set(`${userHero.lastUpdate};${userHero.name};${userHero.species};${userHero.rarity};${userHero.exp};${userHero.feed};${ability};${equipment};${userHero.status}`)
}

const rarityDisplay = (rarity) => ':star:'.repeat(rarity)

//* item effects
const rarityChances = [0.65, 0.30, 0.03, 0.015, 0.005]
const summon = (userHero, heroName) => {
  if (userHero.name) {
    return 'ERROR_HERO_EXISTS'
  }
  if (!heroName) {
    return 'ERROR_HERO_NAME'
  }
  if (heroName.length > 20) {
    return 'ERROR_LENGTH_EXCEED'
  }

  userHero.name = heroName
  userHero.species = species[Math.floor(Math.random() * species.length)]

  // rarity
  let luck = Math.random()
  rarityChances.some((chance, index) => {
    if (luck < chance) {
      userHero.rarity = parseInt(index) + 1
      return true
    }
    luck -= chance
    return false
  })

  // leel
  userHero.exp = 0
  userHero.feed = 100

  // ability
  userHero.str = 0
  userHero.vit = 0
  userHero.int = 0
  userHero.agi = 0
  userHero.luk = 0

  userHero.status = 'stay'
}

const changeName = (userHero, heroName) => {
  if (!userHero.name) {
    return 'ERROR_NO_HERO'
  }
  if (userHero.status === 'dead') {
    return 'ERROR_HERO_DEAD'
  }
  if (!heroName) {
    return 'ERROR_HERO_NAME'
  }
  if (heroName.length > 20) {
    return 'ERROR_LENGTH_EXCEED'
  }

  userHero.name = heroName
}

const changeLooks = (userHero, heroSpecies) => {
  if (!userHero.name) {
    return 'ERROR_NO_HERO'
  }
  if (userHero.status === 'dead') {
    return 'ERROR_HERO_DEAD'
  }
  if (!heroSpecies || species.indexOf(heroSpecies.toLowerCase()) === -1) {
    return 'ERROR_NO_SPECIES'
  }

  userHero.species = heroSpecies
}

const resetAbility = (userHero) => {
  userHero.str = 0
  userHero.vit = 0
  userHero.int = 0
  userHero.agi = 0
  userHero.luk = 0
}

module.exports = {
  // methods
  read,
  write,
  rarityDisplay,

  // item effects
  summon,
  changeName,
  changeLooks,
  resetAbility
}
