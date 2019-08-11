const inventorySystem = require('../util/inventorySystem')
const hintSystem = require('../util/hintSystem')

module.exports = async ({ args, database, message, guildId, userId }) => {
  let userAction = ''
  let hint = ''

  const userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (userInventory.status === 'fishing') {
    userInventory.status = 'stay'
    userAction = '結束釣魚'
    database.ref(`/fishing/${guildId}/${userId}`).remove()
  } else if (userInventory.status === 'stay') {
    if (!userInventory.tools.$0 || !userInventory.tools.$1) {
      return { errorCode: 'ERROR_NO_TOOL' }
    }
    if (userInventory.emptySlots <= 0) {
      return { errorCode: 'ERROR_BAG_FULL' }
    }

    userInventory.status = 'fishing'
    userAction = '開始釣魚'
    hint = hintSystem()

    database.ref(`/fishing/${guildId}/${userId}`).set(`0,0;${userInventory.buffs['%0'] || ''}`)
  } else {
    return { errorCode: 'ERROR_IS_BUSY' }
  }

  // update database
  inventorySystem.write(database, guildId, userId, userInventory, message.createdTimestamp)

  // response
  return { description: `:fishing_pole_and_fish: ${message.member.displayName} ${userAction}\n\n${hint}` }
}
