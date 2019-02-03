const errors = {
  // general
  ERROR_FORMAT: '指令格式錯誤',
  ERROR_NO_ENERGY: '八七能量不足',
  ERROR_NOT_FOUND: '查詢錯誤',

  // add
  ERROR_LENGTH_EXCEED: '關鍵字字數過多',
  ERROR_TERMS_EXCEED: '伺服器關鍵字數量過多',
  ERROR_RES_EXCEED: '回應數量過多',

  // daily
  ERROR_ALREADY_DAILY: '已完成今日簽到',

  // lottery
  ERROR_NUMBER_FORMAT: '投注號碼、投注金額必須是整數',
  ERROR_NUMBER_EXCEED: '投注號碼超過範圍',
  ERROR_ENERGY_EXCEED: '投注能量超過範圍',
  ERROR_REPETITVE_NUMBER: '禁止更改投注號碼',

  // vote
  ERROR_TIME: '時間錯誤'
}

module.exports = (message, code) => {
  message.channel.send({
    embed: {
      color: 0xffa8a8,
      description: `:no_entry_sign: ${errors[code] || '未知的錯誤'}`
    }
  })
}
