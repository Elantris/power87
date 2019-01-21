module.exports = ({ client, message, args }) => {
  let limit = 20

  if (args.length > 1 && Number.isSafeInteger(parseInt(args[1]))) {
    limit = parseInt(args[1])
    if (limit > 100) {
      limit = 100
    } else if (limit < 1) {
      limit = 1
    }
  }
  limit += 1 // include user command

  message.channel
    .fetchMessages({ limit })
    .then((msgs) => {
      msgs.array().forEach(m => {
        if (m.deletable && (m.author.id === client.user.id || m.content.startsWith('87'))) {
          m.delete()
        }
      })
    })
    .catch(console.error)
}
