const heroSystem = require('../util/heroSystem')
const inventorySystem = require('../util/inventorySystem')

module.exports = async ({ args, database, message, guildId, userId }) => {
  // hero system
  const userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero.name) {
    return { errorCode: 'ERROR_NO_HERO' }
  }

  if (!args[1] || args[1] !== userHero.name) {
    return { errorCode: 'ERROR_HERO_NAME' }
  }

  // inventory system
  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)
  if (userInventory.status === 'fishing') {
    return { errorCode: 'ERROR_IS_FISHING' }
  }

  if (userHero.weapon) {
    userInventory.equipments.push({
      id: userHero.weapon.id,
      level: userHero.weapon.level
    })
  }
  if (userHero.armor) {
    userInventory.equipments.push({
      id: userHero.armor.id,
      level: userHero.armor.level
    })
  }
  userInventory.equipments.sort((a, b) => (a.id - b.id) || (b.level - a.level))

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  userEnergy = userEnergy.val()
  const energyGain = Math.floor(userHero.exp * 0.5 + userHero.rarity * 50)

  // update database
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + energyGain)
  database.ref(`/hero/${guildId}/${userId}`).remove()
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  return { description: `:scroll: ${message.member.displayName} 讓 :${userHero.species}: **${userHero.name}** 回歸自由，臨別之前他留下了 ${energyGain} 點八七能量` }
}
