const inventorySystem = require('../util/inventorySystem')
const fishingSystem = require('../util/fishingSystem')
const hints = require('../util/hints')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let userInventory = inventorySystem.parse(inventoryRaw)

    let userStatus = ''
    let hint = ''

    database.ref(`/fishing/${guildId}/${userId}`).once('value').then(snapshot => {
      let fishingRaw = snapshot.val()
      if (fishingRaw) {
        let fishingData = fishingRaw.split(';')
        let count = parseInt(fishingData[1])
        database.ref(`/fishing/${guildId}/${userId}`).remove()

        fishingSystem({ database, guildId, userId, userInventory, count })

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
        userInventory.items = []
        let updates = inventorySystem.make(userInventory, message.createdTimestamp) + ';0'
        database.ref(`/fishing/${guildId}/${userId}`).set(updates)

        userStatus = '開始釣魚'
        hint = hints()
      }

      // response
      sendResponseMessage({ message, description: `:fishing_pole_and_fish: ${message.member.displayName} ${userStatus}\n\n${hint}` })
    })
  })
}
