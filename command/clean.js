module.exports = ({ args, client, message }) => {
  let limit = 30

  if (args.length > 1 && Number.isSafeInteger(parseInt(args[1]))) {
    limit = parseInt(args[1])
    if (limit > 100) {
      limit = 100
    } else if (limit < 2) {
      limit = 2
    }
  }

  message.channel.fetchMessages({ limit }).then(messages => {
    let size = messages.size
    let count = 0
    messages.filter(m => m.deletable).filter(m => m.author.id === client.user.id || m.content.startsWith('87')).tap(message => {
      message.delete().then(message => {
        count++
        if (count === size) {
          message.channel.send(`deleted ${count} messages`).then(message => {
            setTimeout(() => message.delete(), 3000)
          })
        }
      })
    })
  }).catch(console.error)
}
