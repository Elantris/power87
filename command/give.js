const energySystem = require('../util/energySystem')

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length < 3 || !message.mentions.users.array()[0] || !Number.isSafeInteger(parseInt(args[2])) || parseInt(args[2]) < 1) {
    return { errorCode: 'ERROR_FORMAT' }
  }

  let targetId = message.mentions.users.array()[0].id
  let energyGain = parseInt(args[2])
  let energyCost = Math.ceil(energyGain * 1.3)
  let sayMessage = ''

  if (args.length > 3) {
    let tmp = args.slice(3).join(' ')
    if (tmp > 50) {
      return { errorCode: 'ERROR_LENGTH_EXCEED' }
    }
    sayMessage = `${message.member.displayName} 對 <@${targetId}> 說「${tmp}」\n\n`
  }

  // energy system
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = energySystem.INITIAL_USER_ENERGY
    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy)
  }

  if (userEnergy < energyCost) {
    return { errorCode: 'ERROR_NO_ENERGY' }
  }

  let targetEnergy = await database.ref(`/energy/${guildId}/${targetId}`).once('value')
  if (targetEnergy.exists()) {
    targetEnergy = targetEnergy.val()
  } else {
    targetEnergy = energySystem.INITIAL_USER_ENERGY
  }

  // update databse
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy - energyCost)
  database.ref(`/energy/${guildId}/${targetId}`).set(targetEnergy + energyGain)

  // response
  return { description: `:money_mouth: ${sayMessage}${message.member.displayName} 消耗 ${energyCost} 點八七能量，<@${targetId}> 獲得了 ${energyGain} 點八七能量` }
}
