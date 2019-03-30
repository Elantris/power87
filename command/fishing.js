const hints = [
  '',
  '釣魚前記得購買 :school_satchel: 背包與 :fishing_pole_and_fish: 釣竿，別在岸邊癡癡地凝視水面！`87!help buy`',
  '今天天氣真好，是不是有機會釣到稀有的魚呢？',
  '有非常低的機率可以釣到 :gem: 是很值錢的東西！',
  '有空提醒旁邊的人 :school_satchel: 背包滿了，趕快回來賣魚吧。',
  '釣到的垃圾會直接丟到旁邊的垃圾桶，地球感謝你讓海洋更乾淨了一點。',
  ':fishing_pole_and_fish: 釣竿等級越高越容易釣到魚喔',
  '提升 :sailboat: 帆船等級可以解鎖更多種類的魚獲，說不定還可以看到 :penguin:',
  '<https://hackmd.io/s/VkLSj2pOJW> 公告頁面的連結，可以看到最新的更新資訊！',
  '<https://forms.gle/9iYELzNoQ2JRDKeR7> 意見調查的表單，有什麼想對開發者說的話？',
  '不看更新公告，你說你還想玩遊戲？',
  '機率遊戲最討厭得不到想要的，更討厭的是明明這遊戲是自己寫的運氣卻爛到不行',
  ':warning: 警告：本遊戲遊玩過程中並沒有任何動物實際受到傷害。',
  '職業倦怠的開發者，假日都是這個形態 \\_(:3 」∠ )\\_',
  '有人還記得這個機器人最一開始只是一個筆記機器人嗎...?'
]

module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`/fishing/${guildId}/${userId}`).once('value').then(snapshot => {
    let isFishing
    if (!snapshot.exists()) {
      database.ref(`/fishing/${guildId}/${userId}`).set(1)
      isFishing = 1
    } else {
      database.ref(`/fishing/${guildId}/${userId}`).remove()
      isFishing = 0
    }

    let fishingDisplay = [
      '結束釣魚',
      '開始釣魚'
    ]

    let luck = isFishing ? Math.floor(Math.random() * hints.length) : 0

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:fishing_pole_and_fish: ${message.member.displayName} ${fishingDisplay[isFishing]}\n\n${hints[luck]}`
      }
    })
  })
}
