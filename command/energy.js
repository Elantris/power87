const energy = require('../util/energy')

module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = energy.INITIAL_USER_ENERGY
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
    }

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:battery: ${message.member.displayName} 擁有 ${parseInt(userEnergy)} 點八七能量`
      }
    })
  })
}
