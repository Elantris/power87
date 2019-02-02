const maxTermNum = 100
const maxResNum = 50
const energyCost = 10

module.exports = ({ args, database, energies, message, serverId, userId }) => { // add keywords to list
  // check user energy
  if (energies[userId].a < energyCost) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **八七能量不足**'
      }
    })
    return
  }

  // check command format
  if (args.length < 3 || args[1].startsWith('_') || Number.isSafeInteger(parseInt(args[1]))) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

  let term = args[1]

  // check term legnth
  if (term.length > 20) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **字數過多**'
      }
    })
    return
  }

  database.ref(`/responses/${serverId}`).once('value').then(snapshot => {
    let responses = snapshot.val() || { _keep: 1 }

    if (!responses[term]) {
      // check number of terms in server
      let currentTermNum = Object.keys(responses).length - 1
      if (currentTermNum >= maxTermNum) {
        message.channel.send({
          embed: {
            color: 0xffa8a8,
            description: ':no_entry_sign: **伺服器關鍵字過多**'
          }
        })
        return
      }
      responses[term] = {}
    }

    // check length of response list
    let emptyPosition = 1
    for (emptyPosition; emptyPosition <= maxResNum; emptyPosition++) {
      if (!responses[term][emptyPosition]) {
        break
      }
    }
    if (emptyPosition > maxResNum) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: ':no_entry_sign: **項目過多**'
        }
      })
      return
    }

    // add term and response
    let newResponse = args.slice(2).join(' ')
    responses[term][emptyPosition] = newResponse
    energies[userId].a -= energyCost

    database.ref(`/responses/${serverId}`).update(responses)
    database.ref(`/energies/${serverId}/${userId}`).update(energies[userId])

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:white_check_mark: 你說 **87 ${term} ${emptyPosition}** 我說 **${newResponse}**`
      }
    })
  })
}
