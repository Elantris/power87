const energySystem = require('../util/energySystem')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = energySystem.INITIAL_USER_ENERGY
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
    }

    sendResponseMessage({ message, description: `:battery: ${message.member.displayName} 擁有 ${parseInt(userEnergy)} 點八七能量` })
  })
}
