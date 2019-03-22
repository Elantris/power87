const energy = require('../util/energy')
const sendErrorMessage = require('../util/sendErrorMessage')

module.exports = ({ args, database, message, guildId, userId }) => {
  if (args.length < 3 || !message.mentions.users.array()[0] || !Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let targetId = message.mentions.users.array()[0].id
  let energyGain = parseInt(args[2])
  let energyCost = Math.ceil(energyGain * 1.3)
  let sayMessage = ''

  if (args.length > 3) {
    let tmp = args.slice(3).join(' ')
    if (tmp > 50) {
      sendErrorMessage(message, 'ERROR_LENGTH_EXCEED')
      return
    }
    sayMessage = `${message.member.displayName} 對 <@${targetId}> 說「${tmp}」\n\n`
  }

  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = energy.INITIAL_USER_ENERGY
      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
    }
    if (userEnergy < energyCost) {
      sendErrorMessage(message, 'ERROR_NO_ENERGY')
      return
    }

    database.ref(`/energy/${guildId}/${targetId}`).once('value').then(snapshot => {
      let targetEnergy = snapshot.val()
      if (!snapshot.exists()) {
        targetEnergy = energy.INITIAL_USER_ENERGY
      }

      userEnergy -= energyCost
      targetEnergy += energyGain

      database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
      database.ref(`/energy/${guildId}/${targetId}`).set(targetEnergy)

      message.channel.send({
        embed: {
          color: 0xffe066,
          description: `:money_mouth: ${sayMessage}${message.member.displayName} 消耗了 ${energyCost} 點八七能量，<@${targetId}> 獲得了 ${energyGain} 點八七能量`
        }
      })
    })
  })
}
