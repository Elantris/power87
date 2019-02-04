const moment = require('moment')
const sendErrorMessage = require('../sendErrorMessage')

const numberRangeMax = 50
const energyRangeMin = 10
const energyRangeMax = 10000

module.exports = ({ args, database, energies, message, serverId, userId }) => {
  let today = moment().format('YYYYMMDD')

  // last lottery result
  if (energies._lottery && energies._lottery._last !== today) {
    let lotteryNumber = Math.floor(Math.random() * numberRangeMax + 1)
    let winners = []
    let winEnergies = 0
    for (let userId in energies._lottery) {
      if (energies._lottery[userId].g === lotteryNumber) {
        winners.push({
          userId: userId,
          energy: energies._lottery[userId].e
        })
        winEnergies += energies._lottery[userId].e
      }
    }

    let output = `:moneybag: __彩券 ${energies._lottery._last}__ 開出了號碼「**${lotteryNumber}**」`
    if (Object.keys(winners).length === 0) {
      output += `，無人中獎，獎勵能量點數歸零`
    } else {
      output += `，累計 **${energies._lottery._prize}** 點八七能量，恭喜得主：\n`

      winners.sort((a, b) => b.energy - a.energy)
      winners.forEach((winner, index) => {
        let energyWin = Math.floor(energies._lottery._prize * winner.energy / winEnergies)
        output += `\n${index + 1}. <@${winner.userId}> 獲得了 **${energyWin}** 點八七能量`
        energies[userId].a += energyWin
      })
    }

    energies._lottery = null
    database.ref(`/energies/${serverId}`).update(energies)

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: output
      }
    })
  }

  // lottery inition
  if (!energies._lottery) {
    energies._lottery = {
      _last: today,
      _prize: 0
    }
  }

  // check lottery today
  if (args.length === 1) {
    let output = `:moneybag: __彩券 ${today}__ 目前累計 **${energies._lottery._prize}** 點八七能量`
    if (energies._lottery[userId]) {
      output += `\n\n:yen: ${message.member.displayName} 已對號碼 **${energies._lottery[userId].g}** 累計下注 **${energies._lottery[userId].e}** 點八七能量`
    }
    message.channel.send({
      embed: {
        color: 0xffe066,
        description: output
      }
    })
    return
  }

  // check command format
  if (args.length !== 3) {
    sendErrorMessage(message, 'ERROR_FORMAT')
    return
  }

  let guessNumber = parseInt(args[1])
  let energyCost = parseInt(args[2])

  if (!Number.isSafeInteger(guessNumber) || !Number.isSafeInteger(energyCost)) {
    sendErrorMessage(message, 'ERROR_NUMBER_FORMAT')
    return
  }

  if (guessNumber < 1 || guessNumber > numberRangeMax) {
    sendErrorMessage(message, 'ERROR_NUMBER_EXCEED')
    return
  }

  if (energyCost < energyRangeMin || energyCost > energyRangeMax) {
    sendErrorMessage(message, 'ERROR_ENERGY_EXCEED')
    return
  }

  if (energies[userId].a < energyCost) {
    sendErrorMessage(message, 'ERROR_NO_ENERGY')
    return
  }

  // user lottery inition
  if (!energies._lottery[userId]) {
    energies._lottery[userId] = {
      g: guessNumber,
      e: 0
    }
  } else if (guessNumber !== energies._lottery[userId].g) {
    sendErrorMessage(message, 'ERROR_REPETITVE_NUMBER')
    return
  }

  energies[userId].a -= energyCost
  energies._lottery._prize += energyCost
  energies._lottery[userId].e += energyCost

  database.ref(`/energies/${serverId}`).update(energies)

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:yen: ${message.member.displayName} 對號碼 **${guessNumber}** 加注了 **${energyCost}** 點八七能量（個人累計 **${energies._lottery[userId].e}** 點能量）！\n\n` +
        `:moneybag: __彩券 ${today}__ 目前累計 **${energies._lottery._prize}** 點八七能量！`
    }
  })
}
