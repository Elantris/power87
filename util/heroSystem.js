const config = require('../config')

const species = ['ant', 'baby_chick', 'bat', 'bear', 'bee', 'beetle', 'bird', 'blowfish', 'boar', 'bug', 'butterfly', 'camel', 'cat', 'cat2', 'chicken', 'chipmunk', 'cow', 'cow2', 'crab', 'crocodile', 'deer', 'dog', 'dog2', 'dolphin', 'dove', 'dragon', 'dragon_face', 'dromedary_camel', 'duck', 'eagle', 'elephant', 'feet', 'fish', 'fox', 'frog', 'goat', 'gorilla', 'hamster', 'horse', 'jack_o_lantern', 'koala', 'leopard', 'lion_face', 'lizard', 'monkey_face', 'mouse', 'mouse2', 'octopus', 'owl', 'ox', 'panda_face', 'penguin', 'pig', 'pig2', 'poodle', 'rabbit', 'rabbit2', 'racehorse', 'ram', 'rat', 'rhino', 'rooster', 'scorpion', 'shark', 'sheep', 'shrimp', 'snail', 'snake', 'snowman', 'spider', 'squid', 'tiger', 'tiger2', 'tropical_fish', 'turkey', 'turtle', 'unicorn', 'water_buffalo', 'whale', 'whale2', 'wolf']
const expRange = [0, 100, 210, 331, 464, 610, 770, 946, 1139, 1351, 1584, 1840, 2121, 2430, 2769, 3141, 3550, 3999, 4492, 5034, 5630, 6285, 7005, 7797, 8668, 9626, 10679, 11837, 13110, 14510, 16050, 17744, 19607, 21656, 23909, 26387, 29112, 32109, 35405, 39030, 43017, 47402, 52225, 57530, 63365, 69783, 76842, 84606, 93146, 102540, 112873, 9999999]
const rarityChances = {
  summon: [0.65, 0.30, 0.03, 0.015, 0.005],
  enhance: [0, 0.81, 0.27, 0.09, 0.03]
}

// 0 name ; 1 species ; 2 rarity ; 3 exp ; 4 feed ; 5 timeGap:status
// MyPet ; snowman ; 4 ; 200 ; 100 ; 432800:stay
// MyPet ; snowman ; 5 ; 3000 ; 100 ; 155853683:work

const read = async (database, guildId, userId, timenow = Date.now()) => {
  let heroRaw = await database.ref(`/hero/${guildId}/${userId}`).once('value')
  if (!heroRaw.exists()) {
    return {}
  }

  let timeGap = Math.floor(timenow / config.tick)
  let userHero = {
    // basic
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

  let heroData = heroRaw.val().split(';')
  userHero.name = heroData[0]
  userHero.species = heroData[1]
  userHero.rarity = parseInt(heroData[2])
  userHero.exp = parseInt(heroData[3])
  userHero.feed = parseInt(heroData[4])
  userHero.lastUpdate = parseInt(heroData[5])
  userHero.status = heroData[5].split(':')[1] || ''

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
  userHero.lastUpdate = Math.floor(timenow / config.tick)
  database.ref(`/hero/${guildId}/${userId}`).set(`${userHero.name};${userHero.species};${userHero.rarity};${userHero.exp};${userHero.feed};${userHero.lastUpdate}:${userHero.status}`)
}

const rarityDisplay = (rarity) => ':star:'.repeat(parseInt(rarity))

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

  let luck = Math.random()
  rarityChances.summon.some((chance, index) => {
    if (luck < chance) {
      userHero.rarity = parseInt(index) + 1
      return true
    }
    return false
  })

  userHero.exp = 0
  userHero.feed = 100
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
  if (species.indexOf(heroSpecies) === -1) {
    return 'ERROR_NO_SPECIES'
  }

  userHero.species = heroSpecies
}

module.exports = {
  // properties
  species,
  rarityChances,

  // methods
  read,
  write,
  rarityDisplay,

  // items
  summon,
  changeName,
  changeLooks
}
