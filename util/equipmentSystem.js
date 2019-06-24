const equipments = require('./equipments')

const qualityDisplay = {
  base: '初級'
}
const equipmentMapping = {
  weapon: {
    base: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
}
const enhanceChances = {
  base: [0.75, 0.67, 0.59, 0.51, 0.43, 0.35, 0.27, 0.19, 0.11, 0.03]
}

const read = async (database, guildId, userId) => {
  let userEquipment = {
    weapon: [],
    armor: []
  }

  let equipmentRaw = await database.ref(`/equipment/${guildId}/${userId}`).once('value')
  if (!equipmentRaw.exists()) {
    return userEquipment
  }

  equipmentRaw.val().split(',').forEach(equipment => {
    let equipmentData = equipment.split('+')
    let id = parseInt(equipmentData[0])

    userEquipment[equipments[id].kind].push({
      id,
      level: parseInt(equipmentData[1] || 0)
    })
  })

  return userEquipment
}

const write = async (database, guildId, userId, userEquipment) => {
  let equipmentData = []

  userEquipment.weapon.forEach(weapon => {
    equipmentData.push(`${weapon.id.toString().padStart(3, '0')}+${weapon.level}`)
  })
  userEquipment.armor.forEach(armor => {
    equipmentData.push(`${armor.id.toString().padStart(3, '0')}+${armor.level}`)
  })

  equipmentData.sort()

  database.ref(`/equipment/${guildId}/${userId}`).set(equipmentData.join(','))
}

const getEquipment = (userEquipment, kind, quality) => {
  if (!equipmentMapping[kind][quality]) {
    return 'ERROR_NOT_FOUND'
  }

  let luck = Math.floor(Math.random() * equipmentMapping[kind][quality].length)
  userEquipment[kind].push({
    id: equipmentMapping[kind][quality][luck],
    level: 0
  })
  userEquipment._displayName = equipments[luck].displayName
}

const calculateAbility = (id, level) => equipments[id].blank.map((v, i) => v + equipments[id].levelUp[i] * level)

module.exports = {
  // properties
  qualityDisplay,
  enhanceChances,

  // methods
  read,
  write,
  getEquipment,
  calculateAbility
}
