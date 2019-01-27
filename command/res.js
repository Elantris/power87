module.exports = ({ res, message, args }) => {
  if (args.length === 1 || !res[message.guild.id][args[1]]) {
    return
  }

  let serverId = message.guild.id
  let term = args[1]
  let resList = Object.keys(res[serverId][term])
  let choice = resList[Math.floor(Math.random() * resList.length)] // random pick a response from list

  if (args.length >= 3) {
    let key = parseInt(args[2])
    if (!Number.isSafeInteger(key) || !res[serverId][term][key]) {
      return
    }
    choice = key // pick specific response
  }

  message.channel.send(res[serverId][term][choice])
}
