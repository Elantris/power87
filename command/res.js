module.exports = ({ args, database, message, serverId }) => {
  if (args.length === 1) {
    return
  }

  let term = args[1]

  database.ref(`/responses/${serverId}`).once('value').then(snapshot => {
    let responses = snapshot.val()

    // check command format
    if (!responses[term]) {
      return
    }

    let candidates = Object.keys(responses[term])
    let choice

    if (args.length >= 3) {
      // pick specific response
      let position = parseInt(args[2])
      if (!Number.isSafeInteger(position) || !responses[term][position]) {
        message.channel.send({
          embed: {
            color: 0xffa8a8,
            description: `:no_entry_sign: **查詢錯誤**`
          }
        })
        return
      }
      choice = position
    } else {
      // random pick a response from list
      choice = candidates[Math.floor(Math.random() * candidates.length)]
    }

    message.channel.send(responses[term][choice])
  })
}
