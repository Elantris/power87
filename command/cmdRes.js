module.exports = ({ res, message, args }) => {
  if (args.length === 1) {
    message.channel.send('87 **87** __**87**__ __***87***__')
  } else {
    let resList = Object.keys(res[message.guild.id][args[1]])
    if (resList) {
      let choice = resList[Math.floor(Math.random() * resList.length)]
      if (args.length >= 3 && Number.isSafeInteger(parseInt(args[2])) && res[message.guild.id][args[1]][parseInt(args[2])]) {
        choice = parseInt(args[2])
      }
      message.channel.send(res[message.guild.id][args[1]][choice])
    }
  }
}
