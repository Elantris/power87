module.exports = ({ res, message, args }) => {
  if (args.length === 1 || !res[message.guild.id][args[1]]) {
    return
  }

  let resList = Object.keys(res[message.guild.id][args[1]])
  let choice = resList[Math.floor(Math.random() * resList.length)] // random pick a response from list

  if (args.length >= 3) {
    if (!Number.isSafeInteger(parseInt(args[2])) || !res[message.guild.id][args[1]][parseInt(args[2])]) {
      return
    }
    choice = parseInt(args[2]) // pick specific response
  }

  message.channel.send(res[message.guild.id][args[1]][choice])
}
