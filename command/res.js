module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length === 1) {
    return {}
  }

  const term = args[1]
  let choice = args[2]

  database.ref(`/note/${guildId}/${term}`).once('value').then(snapshot => {
    const responses = snapshot.val()
    if (!responses) {
      return
    }

    if (args.length === 2) {
      const candidates = Object.keys(responses)
      choice = candidates[~~(Math.random() * candidates.length)]
    } else if (!responses[choice]) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }

    message.channel.send(responses[choice])
  })
}
