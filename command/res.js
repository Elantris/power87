module.exports = ({ args, cache, message, serverId }) => {
  let term = args[1]

  // check command format
  if (args.length === 1 || !cache[serverId].responses[term]) {
    return
  }

  let candidates = Object.keys(cache[serverId].responses[term])
  let choice = candidates[Math.floor(Math.random() * candidates.length)] // random pick a response from list

  if (args.length >= 3) {
    let position = parseInt(args[2])
    if (!Number.isSafeInteger(position) || !cache[serverId].responses[term][position]) {
      return
    }
    choice = position // pick specific response
  }

  message.channel.send(cache[serverId].responses[term][choice])
}
