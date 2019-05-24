const inventorySystem = require('../util/inventorySystem')
const fishingSystem = require('../util/fishingSystem')
const hints = require('../util/hints')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ database, message, guildId, userId }) => {
  let userInventory = inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  let userStatus = ''
  let hint = ''

  let fishingRaw = await database.ref(`/fishing/${guildId}/${userId}`).once('value')
  if (fishingRaw.exists()) {
    userInventory = fishingSystem({ database, guildId, userId, userInventory, fishingRaw: fishingRaw.val() })
    database.ref(`/fishing/${guildId}/${userId}`).remove()
    inventorySystem.set(database, guildId, userId, userInventory, message.createdTimestamp)

    userStatus = '結束釣魚'
  } else {
    if (!userInventory.tools.$0 || !userInventory.tools.$1) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_TOOL' })
      return
    }
    if (!userInventory.hasEmptySlot) {
      sendResponseMessage(({ message, errorCode: 'ERROR_BAG_FULL' }))
      return
    }

    // update database
    let updates = '0,0;'
    if (userInventory.buffs['%0']) {
      updates += userInventory.buffs['%0']
    }
    database.ref(`/fishing/${guildId}/${userId}`).set(updates)

    userStatus = '開始釣魚'
    hint = hints()
  }

  // response
  sendResponseMessage({ message, description: `:fishing_pole_and_fish: ${message.member.displayName} ${userStatus}\n\n${hint}` })
}
