const fs = require('fs')

const maxTermNum = 50
const maxResNum = 20

module.exports = ({ res, message, args }) => { // add keywords to list
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

  let serverId = message.guild.id
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
  if (!res[serverId][term]) {
    let currentTermNum = Object.keys(res[serverId]).length - 1
    if (currentTermNum >= maxTermNum) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: ':no_entry_sign: **伺服器關鍵字過多**'
        }
      })
      return
    }
    res[serverId][term] = {}
  }

  // check length of response list
  let key = 1
  for (key; key <= maxResNum; key++) {
    if (!res[serverId][term][key]) {
      break
    }
  }
  if (key > maxResNum) {
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
  res[serverId][term][key] = newResponse
  fs.writeFileSync(`./data/${serverId}.json`, JSON.stringify(res[serverId]), { encoding: 'utf8' })

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:white_check_mark: 你說 **87 ${term} ${key}** 我說 **${newResponse}**`
    }
  })
}
