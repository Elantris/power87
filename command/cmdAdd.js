const fs = require('fs')

const maxTermNum = 50
const maxResNum = 20

module.exports = ({ res, message, args }) => { // add keywords to list
  // check command format
  if (args.length < 3 || args[1].startsWith('_') || Number.isSafeInteger(parseInt(args[1]))) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **格式錯誤**: `87!add` __關鍵字__ __回應__'
      }
    })
    return
  }

  // check term legnth
  if (args[1].length > 20) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **字數過多**: 關鍵字長度必須小於 20 個字'
      }
    })
    return
  }

  // init response list of term
  if (!res[message.guild.id][args[1]]) {
    let currentTermNum = Object.keys(res[message.guild.id]).length - 1
    if (currentTermNum === maxTermNum) {
      message.channel.send({
        embed: {
          color: 0xffa8a8,
          description: ':no_entry_sign: **關鍵字過多**: 先刪除一些關鍵字底下的所有回應'
        }
      })
      return
    }
    res[message.guild.id][args[1]] = {}
  }

  // check length of response list
  let key = 1
  for (key; key <= maxResNum; key++) {
    if (!res[message.guild.id][args[1]][key]) {
      break
    }
  }
  if (key > maxResNum) {
    message.channel.send({
      embed: {
        color: 0xffa8a8,
        description: ':no_entry_sign: **項目過多**: 先刪除一些項目以騰出更多空間'
      }
    })
    return
  }

  // add term and response
  res[message.guild.id][args[1]][key] = args.slice(2).join(' ')
  fs.writeFileSync(`./data/${message.guild.id}.json`, JSON.stringify(res[message.guild.id]), { encoding: 'utf8' })

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: `:white_check_mark: 關鍵字 **${args[1]}** 新增了項目 **${key}**`
    }
  })
}
