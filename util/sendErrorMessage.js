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
  ERROR_MAX_LEVEL: '道具已達最高等級'
}

module.exports = (message, code) => {
  message.channel.send({
    embed: {
      color: 0xffa8a8,
      description: `:no_entry_sign: ${errors[code] || '未知的錯誤'}`
    }
  })
}
