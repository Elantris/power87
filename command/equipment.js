const equipmentSystem = require('../util/equipmentSystem')
const equipments = require('../util/equipments')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userEquipment = await equipmentSystem.read(database, guildId, userId)

  let description = `:scroll: ${message.member.displayName} 擁有的裝備：`

  description += `\n\n__武器__：\n`
  userEquipment.weapon.forEach(weapon => {
    let ability = equipmentSystem.calculateAbility(weapon.id, weapon.level)

    description += `\n${equipments[weapon.id].icon}**${equipments[weapon.id].displayName}**+${weapon.level}，\`ATK\`: ${ability[0]} / \`HIT\`: ${ability[1]} / \`SPD\`: ${ability[2]}，\`87!enhance ${equipments[weapon.id].name}+${weapon.level}\``
  })

  description += `\n\n__防具__：\n`
  userEquipment.armor.forEach(armor => {
    let ability = equipmentSystem.calculateAbility(armor.id, armor.level)

    description += `\n${equipments[armor.id].icon}**${equipments[armor.id].displayName}**+${armor.level}，\`DEF\`: ${ability[0]} / \`EV\`: ${ability[1]} / \`SPD\`: ${ability[2]}，\`87!enhance ${equipments[armor.id].name}+${armor.level}\``
  })

  sendResponseMessage({ message, description })
}
