const equipmentSystem = require('../util/equipmentSystem')
const equipments = require('../util/equipments')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userEquipment = await equipmentSystem.read(database, guildId, userId)

  let description = `:scroll: ${message.member.displayName} 擁有的裝備：`

  description += `\n\n__武器__：\n`
  description += userEquipment.weapon.map(weapon => `${equipments[weapon.id].icon}**${equipments[weapon.id].displayName}**+${weapon.level}，\`87!enhance ${equipments[weapon.id].name}+${weapon.level}\``).join('\n')

  description += `\n\n__防具__：\n`
  description += userEquipment.armor.map(armor => `${equipments[armor.id].icon}**${equipments[armor.id].displayName}**+${armor.level}，\`87!enhance ${equipments[armor.id].name}+${armor.level}\``).join('\n')

  sendResponseMessage({ message, description })
}
