const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const hints = require('../util/hints')
const fishings = require('../util/fishings')

module.exports = ({ database, message, fishing, guildId, userId }) => {
  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventory.parseInventory(inventoryRaw)

    let userStatus = ''
    let hint = ''

    if (fishing[guildId] && typeof fishing[guildId][userId] === 'number') {
      database.ref(`/fishing/${guildId}/${userId}`).remove()
      let count = fishing[guildId][userId]
      fishings({ database, guildId, userId, userInventory, count })
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

      database.ref(`/fishing/${guildId}/${userId}`).set(0)
      userStatus = '開始釣魚'
      hint = hints()
    }

    sendResponseMessage({ message, description: `:fishing_pole_and_fish: ${message.member.displayName} ${userStatus}\n\n${hint}` })
  })
}
