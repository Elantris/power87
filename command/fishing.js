const sendResponseMessage = require('../util/sendResponseMessage')
const inventory = require('../util/inventory')
const hints = require('../util/hints')

module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`/inventory/${guildId}/${userId}`).once('value').then(snapshot => {
    let inventoryRaw = snapshot.val()
    if (!snapshot.exists()) {
      inventoryRaw = ''
      database.ref(`/inventory/${guildId}/${userId}`).set('')
    }
    let usreInventory = inventory.parseInventory(inventoryRaw)

    if (!usreInventory.tools.$0 || !usreInventory.tools.$1) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_TOOL' })
      return
    }

    database.ref(`/fishing/${guildId}/${userId}`).once('value').then(snapshot => {
      let isFishing = 0
      let hint = ''

      if (!snapshot.exists()) {
        database.ref(`/fishing/${guildId}/${userId}`).set(1)
        isFishing = 1
        hint = hints()
      } else {
        database.ref(`/fishing/${guildId}/${userId}`).remove()
      }

      let fishingDisplay = [
        '結束釣魚',
        '開始釣魚'
      ]

      sendResponseMessage({ message, description: `:fishing_pole_and_fish: ${message.member.displayName} ${fishingDisplay[isFishing]}\n\n${hint}` })
    })
  })
}
