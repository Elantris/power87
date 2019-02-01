const energyCost = 20

module.exports = ({ args, database, energies, message, serverId, userId }) => { // remove the response from the keyword
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
  if (args.length < 3 || !Number.isSafeInteger(parseInt(args[2]))) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

  let term = args[1]
  let position = parseInt(args[2])

  database.ref(`/responses/${serverId}`).once('value').then(snapshot => {
    let responses = snapshot.val()

    // check term and response exists
    if (!Number.isSafeInteger(position) || !responses[term] || !responses[term][position]) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: `:no_entry_sign: **查詢錯誤**`
        }
      })
      return
    }

    responses[term][position] = null
    energies[userId].a -= energyCost

    database.ref(`/responses/${serverId}`).update(responses)
    database.ref(`/energies/${serverId}`).update(energies)

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:fire: 移除了 **${term}** 的第 **${position}** 個項目`
      }
    })
  })
}
