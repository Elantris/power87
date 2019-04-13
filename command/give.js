const energySystem = require('../util/energySystem')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ args, database, message, guildId, userId }) => {
  if (args.length < 3 || !message.mentions.users.array()[0] || !Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let targetId = message.mentions.users.array()[0].id
  let energyGain = parseInt(args[2])
  let energyCost = Math.ceil(energyGain * 1.3)
  let sayMessage = ''

  if (args.length > 3) {
    let tmp = args.slice(3).join(' ')
    if (tmp > 50) {
      sendResponseMessage({ message, errorCode: 'ERROR_LENGTH_EXCEED' })
      return
    }
    sayMessage = `${message.member.displayName} 對 <@${targetId}> 說「${tmp}」\n\n`
  }

  // energy system
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = energySystem.INITIAL_USER_ENERGY
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
    }

    if (userEnergy < energyCost) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
      return
    }

    database.ref(`/energy/${guildId}/${targetId}`).once('value').then(snapshot => {
      let targetEnergy = snapshot.val()
      if (!snapshot.exists()) {
        targetEnergy = energySystem.INITIAL_USER_ENERGY
      }

      // update databse
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
      database.ref(`/energy/${guildId}/${targetId}`).set(targetEnergy + energyGain)

      // response
      sendResponseMessage({ message, description: `:money_mouth: ${sayMessage}${message.member.displayName} 消耗了 ${energyCost} 點八七能量，<@${targetId}> 獲得了 ${energyGain} 點八七能量` })
    })
  })
}
