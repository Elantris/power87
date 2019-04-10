const moment = require('moment')
const Discord = require('discord.js')
const config = require('../config')

const hook = new Discord.WebhookClient(config.LoggerHook.id, config.LoggerHook.token)

const errors = {
  // general
  ERROR_FORMAT: '指令格式錯誤',
  ERROR_NOT_FOUND: '查詢錯誤',

  // add
  ERROR_LENGTH_EXCEED: '字數過多',
  ERROR_TERMS_EXCEED: '伺服器關鍵字數量過多',
  ERROR_RES_EXCEED: '回應數量過多',

  // energy
  ERROR_NO_ENERGY: '八七能量不足',
  ERROR_ENERGY_EXCEED: '投注能量超過範圍',
  ERROR_MAX_LEVEL: '無法購買更高等級的道具',
  ERROR_IS_FISHING: '正在釣魚',
  ERROR_NO_TOOL: '未持有特定道具',
  ERROR_NO_ITEM: '沒有物品',
  ERROR_BAG_FULL: '背包沒有足夠空間'
}

// command history
let cmdLogs = {}

module.exports = ({ message, description = '', errorCode }) => {
  let embed = {}
  if (errorCode) {
    embed = {
      color: 0xffa8a8,
      description: `:no_entry_sign: ${errors[errorCode] || '未知的錯誤'}`
    }
  } else {
    embed = {
      color: 0xffe066,
      description
    }
  }

  message.channel.send({ embed })

  // logger
  let userId = message.author.id
  let past = message.createdTimestamp - 10 * 60 * 1000
  let warning = ''

  if (!cmdLogs[userId]) {
    cmdLogs[userId] = []
  }
  cmdLogs[userId].push(message.createdTimestamp)
  while (cmdLogs[userId][0] < past) {
    cmdLogs[userId].shift()
  }
  if (cmdLogs[userId].length > 60) {
    warning = ':warning:'
  }

  let timeDisplay = moment(message.createdAt).format('HH:mm:ss')
  embed.title = `\`[${timeDisplay}]\` ${message.content}`
  embed.fields = [{
    name: 'Guild',
    value: `${message.guild.id}\n${message.guild.name}`,
    inline: true
  }, {
    name: 'Channel',
    value: `${message.channel.id}\n${message.channel.name}`,
    inline: true
  }, {
    name: 'User',
    value: `${userId} ${warning}\n${message.member.displayName} (${cmdLogs[userId].length})`,
    inline: true
  }]

  hook.send({
    embeds: [embed]
  })
}
