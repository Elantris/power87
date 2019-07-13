module.exports = async ({ args, database, message, guildId, userId }) => {
  let description = ':bookmark_tabs: '

  if (args.length === 1) {
    let notes = await database.ref(`/note/${guildId}`).once('value')
    notes = notes.val() || {}

    description += '所有關鍵字\n'
    for (const term in notes) {
      description += `\n${term} (${Object.keys(notes[term]).length})`
    }
  } else {
    const term = args[1]
    let responses = await database.ref(`/note/${guildId}/${term}`).once('value')
    if (!responses.val()) {
      return { errorCode: 'ERROR_NOT_FOUND' }
    }
    responses = responses.val()

    description += `**${term}** 的回應列表 [${Object.keys(responses).length}/50]\n`
    for (const index in responses) {
      description += `\n${index}. ${responses[index]}`
    }
  }

  return { description }
}
