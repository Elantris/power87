const sendResponseMessage = require('../util/sendResponseMessage')

const hints = [
  '釣魚前記得購買 :school_satchel: 背包與 :fishing_pole_and_fish: 釣竿，別在岸邊癡癡地凝視水面！`87!help buy`',
  '有非常低的機率可以釣到 :gem: 是很值錢的東西！',
  '有空提醒旁邊的人背包滿了，趕快回來賣魚吧。',
  '釣到的垃圾會直接丟到旁邊的垃圾桶，地球感謝你讓海洋更乾淨了一點。',
  ':fishing_pole_and_fish: 釣竿等級越高越容易釣到魚喔',
  '提升 :sailboat: 帆船等級可以解鎖更多種類的魚獲，說不定還可以看到 :penguin:',
  '公告頁面的連結，可以看到最新的更新資訊！ <https://hackmd.io/s/VkLSj2pOJW>',
  '意見調查的表單，有什麼話想對開發者說？ <https://forms.gle/9iYELzNoQ2JRDKeR7>',
  '不看更新公告，還說你想玩遊戲？',
  '機率遊戲最討厭抽不到想要的，更討厭這遊戲明明是自己寫的運氣卻爛到不行 ╮(′～‵〞)╭',
  ':warning: 警告：本遊戲遊玩過程中並沒有任何動物實際受到傷害。',
  '職業倦怠的開發者，假日都是這個形態 \\_(:3 」∠ )\\_',
  '有人還記得這個機器人最一開始只是一個筆記機器人嗎...?',
  '好希望認識真正數學系的人幫我算期望值喔',
  '`87!help` 是個很棒的指令，真希望每個人下指令前都先用一次',
  '運氣不好嗎？別擔心，我也是，你看過哪個開發者跟玩家要錢只為了測試新功能的 (´Ａ｀。)',
  '每次替功能增加點趣味性，寫著寫著就想乾脆獨立成一個新的指令，例如現在這個釣魚的提示XD',
  '寫這個遊戲還真的見識到了不少東西耶，比如說人類賭性堅強的一面~~（迫使我改資料存取方式的爆棚流量）~~',
  '別著急，這遊戲才剛開始！*（我還有很多點子還沒加進去）*',
  '上次不小心釣到 :gem: 被自己的運氣娛樂到了 (´・ω・`)',
  '「贏要衝、輸要梭哈」「小賭怡情、大賭尤加利葉」',
  '「有錢不賭愧對父母，賭光輸光為國爭光」'
]

module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`/fishing/${guildId}/${userId}`).once('value').then(snapshot => {
    let isFishing = 0
    let hint = ''

    if (!snapshot.exists()) {
      database.ref(`/fishing/${guildId}/${userId}`).set(1)
      isFishing = 1
      hint = hints[Math.floor(Math.random() * hints.length)]
    } else {
      database.ref(`/fishing/${guildId}/${userId}`).remove()
    }

    let fishingDisplay = [
      '結束釣魚',
      '開始釣魚'
    ]

    sendResponseMessage({ message, description: `:fishing_pole_and_fish: ${message.member.displayName} ${fishingDisplay[isFishing]}\n\n${hint}` })
  })
}