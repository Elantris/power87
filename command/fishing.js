const inventorySystem = require('../util/inventorySystem')
const hints = require('../util/hints')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  let userAction = ''
  let hint = ''

  let userInventory = await inventorySystem.read(database, guildId, userId, message.createdTimestamp)

  if (userInventory.status === 'fishing') {
    userAction = '結束釣魚'

    database.ref(`/fishing/${guildId}/${userId}`).remove()
  } else if (userInventory.status === 'return') {
    userAction = '從大洋歸來'
  } else {
    if (!userInventory.tools.$0 || !userInventory.tools.$1) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_TOOL' })
      return
    }
    if (userInventory.emptySlots <= 0) {
      sendResponseMessage(({ message, errorCode: 'ERROR_BAG_FULL' }))
      return
    }

    userAction = '開始釣魚'
    hint = hints()

    database.ref(`/fishing/${guildId}/${userId}`).set(`0,0;${userInventory.buffs['%0'] || ''}`)
  }

  // response
  sendResponseMessage({ message, description: `:fishing_pole_and_fish: ${message.member.displayName} ${userAction}\n\n${hint}` })
}
