const fs = require('fs')

const maxTermNum = 50
const maxResNum = 20

module.exports = ({ message, args, cache, serverId, userId }) => { // add keywords to list
  // check user energy
  if (cache[serverId].energies[userId].amount < 10) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **87 能量不足**'
      }
    })
    return
  }

  // check command format
  if (args.length < 3 || args[1].startsWith('_') || Number.isSafeInteger(parseInt(args[1]))) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**'
      }
    })
    return
  }

  let term = args[1]

  // check term legnth
  if (term.length > 20) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **字數過多**'
      }
    })
    return
  }

  // init response list of term
  if (!cache[serverId].responses[term]) {
    let currentTermNum = Object.keys(cache[serverId].responses).length - 1
    if (currentTermNum >= maxTermNum) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: ':no_entry_sign: **伺服器關鍵字過多**'
        }
      })
      return
    }
    cache[serverId].responses[term] = {}
  }

  // check length of response list
  let emptyPosition = 1
  for (emptyPosition; emptyPosition <= maxResNum; emptyPosition++) {
    if (!cache[serverId].responses[term][emptyPosition]) {
      break
    }
  }
  if (emptyPosition > maxResNum) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **項目過多**'
      }
    })
    return
  }

  // add term and response
  let newResponse = args.slice(2).join(' ')
  cache[serverId].responses[term][emptyPosition] = newResponse
  fs.writeFileSync(`./data/${serverId}.json`, JSON.stringify(cache[serverId]), { encoding: 'utf8' })
  cache[serverId].energies[userId].amount -= 10

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:white_check_mark: 你說 **87 ${term} ${emptyPosition}** 我說 **${newResponse}**`
    }
  })
}
