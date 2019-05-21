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
  ERROR_IS_FISHING: '出海捕魚中',
  ERROR_NO_TOOL: '未持有特定道具',
  ERROR_NO_ITEM: '沒有物品',
  ERROR_BAG_FULL: '背包沒有足夠空間',
  ERROR_NOT_USABLE: '不可使用的物品',

  // hero
  ERROR_NO_HERO: '沒有召喚的英雄',
  ERROR_HERO_DEAD: '英雄已經死亡',
  ERROR_HERO_EXISTS: '只能召喚一隻英雄',
  ERROR_HERO_NAME: '請輸入英雄的名字',
  ERROR_MAX_RARITY: '已達最高星數',
  ERROR_NO_SPECIES: '不存在的外觀'
}

// command history
let userCmdLogs = {}

module.exports = ({ message, content, description = '', errorCode }) => {
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

  message.channel.send(content, { embed })

  // logger
  let userId = message.author.id
  let past = message.createdTimestamp - 10 * 60 * 1000
  let warning = ''

  if (!userCmdLogs[userId]) {
    userCmdLogs[userId] = []
  }
  userCmdLogs[userId].push(message.createdTimestamp)
  while (userCmdLogs[userId][0] < past) {
    userCmdLogs[userId].shift()
  }
  if (userCmdLogs[userId].length > 90) {
    warning = ':x:'
  } else if (userCmdLogs[userId].length > 60) {
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
    value: `${userId}${warning}\n${message.member.displayName} (${userCmdLogs[userId].length})`,
    inline: true
  }]

  hook.send({
    embeds: [embed]
  })
}
