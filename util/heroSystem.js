const config = require('../config')
const inventorySystem = require('./inventorySystem')

// * properties
const species = ['ant', 'baby_chick', 'bat', 'bear', 'bee', 'beetle', 'bird', 'blowfish', 'boar', 'bug', 'butterfly', 'camel', 'cat', 'cat2', 'chicken', 'chipmunk', 'cow', 'cow2', 'crab', 'crocodile', 'deer', 'dog', 'dog2', 'dolphin', 'dove', 'dragon', 'dragon_face', 'dromedary_camel', 'duck', 'eagle', 'elephant', 'feet', 'fish', 'fox', 'frog', 'goat', 'gorilla', 'hamster', 'horse', 'jack_o_lantern', 'koala', 'leopard', 'lion_face', 'lizard', 'monkey_face', 'mouse', 'mouse2', 'octopus', 'owl', 'ox', 'panda_face', 'penguin', 'pig', 'pig2', 'poodle', 'rabbit', 'rabbit2', 'racehorse', 'ram', 'rat', 'rhino', 'rooster', 'scorpion', 'shark', 'sheep', 'shrimp', 'snail', 'snake', 'snowman', 'spider', 'squid', 'tiger', 'tiger2', 'tropical_fish', 'turkey', 'turtle', 'unicorn', 'water_buffalo', 'whale', 'whale2', 'wolf']
const expRange = [0, 100, 210, 331, 464, 610, 770, 946, 1139, 1351, 1584, 1840, 2121, 2430, 2769, 3141, 3550, 3999, 4492, 5034, 5630, 6285, 7005, 7797, 8668, 9626, 10679, 11837, 13110, 14510, 16050, 17744, 19607, 21656, 23909, 26387, 29112, 32109, 35405, 39030, 43017, 47402, 52225, 57530, 63365, 69783, 76842, 84606, 93146, 102540, 112873, 9999999]

// 0 lastUpdate : timeGap
// 1 status : string
// 2 name : string
// 3 species : string
// 4 rarity : number
// 5 experience : number
// 6 feed : number
// 7 ability : array (number)
// 8 weapon : string
// 9 armor : string

// * methods
const read = async (database, guildId, userId, timenow = Date.now()) => {
  const heroRaw = await database.ref(`/hero/${guildId}/${userId}`).once('value')
  if (!heroRaw.exists()) {
    return {}
  }

  const timeGap = Math.floor(timenow / config.tick)
  const userHero = {
    lastUpdate: 0,

    // basic
    status: '',
    name: '',
    species: '',
    rarity: 1,
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
    spd: 1,
    hit: 1,
    ev: 1
  }

  const heroData = heroRaw.val().split(';')

  userHero.lastUpdate = parseInt(heroData[0])
  userHero.status = heroData[1]
  userHero.name = heroData[2]
  userHero.species = heroData[3]
  userHero.rarity = parseInt(heroData[4])
  userHero.exp = parseInt(heroData[5])
  userHero.feed = parseInt(heroData[6])

  const heroAbilities = heroData[7].split(',').map(v => parseInt(v))
  userHero.str = heroAbilities[0]
  userHero.vit = heroAbilities[1]
  userHero.agi = heroAbilities[2]
  userHero.int = heroAbilities[3]
  userHero.luk = heroAbilities[4]

  // equipment
  if (heroData[8]) {
    userHero.weapon = inventorySystem.parseEquipment(heroData[8])
    const abilities = inventorySystem.calculateAbility(userHero.weapon.id, userHero.weapon.level)
    userHero.atk += abilities[0]
    userHero.hit += abilities[1]
    userHero.spd += abilities[2]
  }
  if (heroData[9]) {
    userHero.armor = inventorySystem.parseEquipment(heroData[9])
    const abilities = inventorySystem.calculateAbility(userHero.armor.id, userHero.armor.level)
    userHero.def += abilities[0]
    userHero.ev += abilities[1]
    userHero.spd += abilities[2]
  }

  // level
  for (const level in expRange) {
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
  if (userHero.feed < 0) {
    userHero.feed = 0
  }
  userHero.feedPercent = (userHero.feed * 100 / userHero.maxFeed).toFixed(2)

  return userHero
}

const write = (database, guildId, userId, userHero, timenow = Date.now()) => {
  userHero.lastUpdate = Math.floor(timenow / config.tick)

  const ability = `${userHero.str},${userHero.vit},${userHero.agi},${userHero.int},${userHero.luk}`
  const weapon = userHero.weapon ? `&${userHero.weapon.id.toString().padStart(4, '0')}+${userHero.weapon.level}` : ``
  const armor = userHero.armor ? `&${userHero.armor.id.toString().padStart(4, '0')}+${userHero.armor.level}` : ``

  database.ref(`/hero/${guildId}/${userId}`).set(`${userHero.lastUpdate};${userHero.status};${userHero.name};${userHero.species};${userHero.rarity};${userHero.exp};${userHero.feed};${ability};${weapon};${armor}`)
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

const randomRange = (min, max) => Math.random() * (max - min) + min

const battleDamage = (attacker, defender) => {
  // hit detection
  const hit = attacker.hit * randomRange(0.2, 1 + attacker.int * 0.02)
  const ev = defender.ev * randomRange(0, 1 + defender.luk * 0.02)
  if (hit < ev) {
    return 0
  }

  // damage calculation
  const atk = attacker.atk * randomRange(0.8, 1.2 + attacker.str * 0.02)
  const def = defender.def * randomRange(0.4, 1 + defender.vit * 0.02)
  let damage = atk - def
  if (damage < 1) {
    damage = 1
  }
  damage = Math.floor(damage)
  defender.hp -= damage
  if (defender.hp < 0) {
    defender.hp = 0
  }

  return damage
}

const battleRecords = (attacker, defender) => {
  attacker.hp = attacker.rarity * 5 + attacker.level * 2
  defender.hp = defender.rarity * 5 + defender.level * 2
  const records = []
  // attacker, defender, damage, defenderHp

  while (records.length < 10 && attacker.hp && defender.hp) {
    const spd1 = attacker.spd * Math.random() * (1 + attacker.agi * 0.02)
    const spd2 = defender.spd * Math.random() * (1 + defender.agi * 0.02)
    let damage = 0
    if (spd1 > spd2) {
      damage = battleDamage(attacker, defender)
      records.push({
        attackerHp: attacker.hp,
        defenderHp: defender.hp,
        order: 0,
        damage
      })

      damage = battleDamage(defender, attacker)
      records.push({
        attackerHp: attacker.hp,
        defenderHp: defender.hp,
        order: 1,
        damage
      })
    } else {
      damage = battleDamage(defender, attacker)
      records.push({
        attackerHp: attacker.hp,
        defenderHp: defender.hp,
        order: 1,
        damage
      })

      damage = battleDamage(attacker, defender)
      records.push({
        attackerHp: attacker.hp,
        defenderHp: defender.hp,
        order: 0,
        damage
      })
    }
  }

  return records
}

module.exports = {
  // properties
  species,

  // methods
  read,
  write,
  rarityDisplay,

  // item effects
  summon,
  changeName,
  changeLooks,
  resetAbility,
  battleRecords
}
