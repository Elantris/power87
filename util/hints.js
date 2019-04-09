const tools = require('./tools')
const items = require('./items')
const buffs = require('./buffs')
const mapping = {
  Bag: tools.$0,
  FishingPole: tools.$1,
  SailBoat: tools.$2,
  Trident: tools.$3,
  gem: items[0],
  penguin: items[1],
  bait: buffs['%0'],
  candy: buffs['%1']
}

const display = (item) => `${mapping[item].icon}**${mapping[item].displayName}**`

const hints = [
  // project, system
  '公告頁面的連結，這裡可以看到更新資訊！ <https://hackmd.io/s/VkLSj2pOJW>',
  '意見調查的表單，有什麼話想對開發者說？ <https://forms.gle/9iYELzNoQ2JRDKeR7>',
  '`87!help` 是個很棒的指令，真希望每個人下指令前都先用一次',
  '有空就多看看更新公告或者是使用 `87!hint` 吧',

  // game
  `\`87!buy\` 釣魚前記得購買 ${display('Bag')} 與 ${display('FishingPole')}`,
  `${display('FishingPole')} 等級越高越容易釣到魚喔`,
  `提升 ${display('SailBoat')} 等級可以解鎖更多種類的魚獲，說不定還可以看到 ${display('penguin')}`,
  `道具屋上架了 ${display('Trident')}，提升等級可以增加稀有魚種獲得的機率，快使用 \`87!buy\` 吧'`,
  `有非常低的機率可以釣到 ${display('gem')} 是很值錢的東西！`,
  '有空提醒旁邊的人背包滿了，趕快回來賣魚吧。',
  '接聽語音頻道可以獲得能量點數，進入釣魚模式有較高的機率釣到魚，但拒聽（關閉耳機圖示）視同未接聽語音頻道！',
  '`87!daily` 每日簽到可以獲得固定點數，累計連續簽到的話還可以獲得額外的獎勵點數',
  '`87!slot` 來試試手氣吧！',
  `\`87!buy\` 道具屋新增了增益道具 ${display('bait')}、${display('candy')}，使用後可以在一定時間內獲得特殊效果，快去看看吧！`,
  '`87!use` 可以使用背包內的增益道具',
  '`87!help` 除了指令以外現在還可以用道具或物品的圖示、名稱查詢詳細說明，例如 `87!help :candy:`',
  '遇到不知道用處的東西就用 `87!help` 查看吧',
  '為了避免賣掉不該賣的東西，使用 `87!sell` 指令時可以只賣掉特定分類的物品，例如 `87!sell fish`',

  // murmur
  '釣到的垃圾會直接丟到旁邊的垃圾桶，地球感謝你讓海洋更乾淨了一點。',
  '不看更新公告，還說你想玩遊戲？',
  '機率遊戲最討厭抽不到想要的，更討厭這遊戲明明是自己寫的運氣卻爛到不行 ╮(′～‵〞)╭',
  ':warning: 警告：本遊戲遊玩過程中並沒有任何動物實際受到傷害。',
  '`87!help list` 有人還記得這個機器人最一開始只是一個筆記機器人嗎？',
  '寫這個遊戲還真的見識到了不少東西，比如說人類賭性堅強的一面',
  '「贏要衝、輸要梭哈」「小賭怡情、大賭尤加利葉」「有錢不賭愧對父母，賭光輸光為國爭光」「有賭有希望，沒錢有腎臟」',
  '喵PASS ~(*′△`)ﾉ',
  '你已經被 :doughnut: 幸運甜甜圈造訪，它對你的人生並不會帶來什麼改變。',
  '2019 年的我開始在 YouTube 上隨便亂逛，這是寫 Power87 時最常聽的頻道其中一首歌 <https://www.youtube.com/watch?v=BCt9lS_Uv_Y>',

  // dev
  'hello, world',
  '別著急，這遊戲才剛開始！（我還有很多點子還沒加進去）',
  '職業倦怠的開發者，假日都是這個形態 \\_(:3 」∠ )\\_',
  '好希望認識真正數學系的人幫我算期望值喔',
  '為了平衡一下每個指令用的程式碼行數，我決定增加這裡廢文ㄉ數量',
  '不知不覺這個專案也突破一千行程式碼了，每次更新後還能正常運作真是奇蹟',
  '*按一下以編輯文字*'
]

module.exports = (luck) => {
  if (luck) {
    return hints[luck] || -1
  }

  luck = Math.floor(Math.random() * hints.length)

  return hints[luck]
}
