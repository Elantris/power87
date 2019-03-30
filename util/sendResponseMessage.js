const moment = require('moment')
const Discord = require('discord.js')
const config = require('../config')

const hook = new Discord.WebhookClient(config.LoggerHook.id, config.LoggerHook.token)

const errors = {
  // general
  ERROR_FORMAT: '指令格式錯誤',
  ERROR_NO_ENERGY: '八七能量不足',
  ERROR_NOT_FOUND: '查詢錯誤',

  // add
  ERROR_LENGTH_EXCEED: '字數過多',
  ERROR_TERMS_EXCEED: '伺服器關鍵字數量過多',
  ERROR_RES_EXCEED: '回應數量過多',

  // energy
  ERROR_ALREADY_DAILY: '已完成今日簽到',
  ERROR_ENERGY_EXCEED: '投注能量超過範圍',
  ERROR_MAX_LEVEL: '無法購買更高等級的道具',
  ERROR_IS_FISHING: '正在釣魚'
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
  while (cmdLogs[userId] < past) {
    cmdLogs[userId].shift()
  }
  if (cmdLogs[userId].length > 100) {
    warning = ':warning:'
  }

  let timeDisplay = moment(message.createdAt).format('HH:mm:ss')
  hook.send({
    embeds: [{
      color: 0xadb5bd,
      description: `\`[${timeDisplay}]\` <@${message.author.id}>: \`${message.content}\``,
      fields: [{
        name: 'Guild',
        value: `${message.guild.id}\n${message.guild.name}`,
        inline: true
      }, {
        name: 'Channel',
        value: `${message.channel.id}\n${message.channel.name}`,
        inline: true
      }, {
        name: 'User',
        value: `${message.author.id}\n${message.member.displayName}`,
        inline: true
      }, {
        name: 'Usage',
        value: `${cmdLogs[userId].length} ${warning}`
      }]
    }, embed]
  })
}