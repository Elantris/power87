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

const wrappedItem = (item) => `${mapping[item].icon}**${mapping[item].displayName}**`
const wrappedCode = (code) => `\`87!${code}\``

const hints = [
  // project, system
  `公告頁面的連結，這裡可以看到更新資訊！ <https://hackmd.io/s/VkLSj2pOJW>`,
  `意見調查的表單，有什麼話想對開發者說？ <https://forms.gle/9iYELzNoQ2JRDKeR7>`,
  `${wrappedCode('help')} 除了指令以外現在還可以用道具或物品的圖示、名稱查詢詳細說明，例如 ${wrappedCode('help :candy:')}`,
  `遇到不知道用處的物品可以用 ${wrappedCode('help')} 查看詳細說明`,
  `${wrappedCode('help')} 是個很棒的指令，真希望每個人下指令前都先用一次`,
  `${wrappedCode('hint')} 可能會有一些攻略提示或是開發者的喃喃自語`,

  // game
  `${wrappedCode('help list')} 有人還記得這個機器人最一開始只是一個筆記機器人嗎？`,
  `${wrappedCode('daily')} 每日簽到可以獲得固定點數，累計連續簽到的話還可以獲得額外的獎勵點數`,
  `${wrappedCode('slot')} 來試試手氣吧！`,
  `${wrappedCode('buy')} 釣魚前記得購買 ${wrappedItem('Bag')} 與 ${wrappedItem('FishingPole')}`,
  `${wrappedCode('buy')} 購買的增益道具會放進背包裡，記得使用 ${wrappedCode('use')} 來獲得特殊效果`,
  `為了避免賣掉不該賣的東西，${wrappedCode('sell')} 可以只賣掉特定分類的物品，例如 ${wrappedCode('sell fish')}`,
  `${wrappedItem('FishingPole')} 等級越高越容易釣到魚`,
  `提升 ${wrappedItem('SailBoat')} 等級可以解鎖更多種類的魚獲，說不定還可以看到 ${wrappedItem('penguin')}`,
  `道具屋上架了 ${wrappedItem('Trident')}，提升等級可以增加稀有魚種獲得的機率`,
  `有非常低的機率可以釣到 ${wrappedItem('gem')} 是很值錢的東西！`,
  `${wrappedItem('bait')} 購買後會放進背包裡，記得使用 ${wrappedCode('87!use')} 指令獲得增益效果`,
  `你是不是把 ${wrappedItem('bait')} 放在身上當護身符啊？`,
  `有空提醒旁邊的人背包滿了，趕快回來賣魚吧。`,
  `接聽語音頻道可以獲得能量點數，進入釣魚模式有較高的機率釣到魚，但拒聽（關閉耳機圖示）視同未接聽語音頻道！`,

  // murmur
  '釣到的垃圾會直接丟到旁邊的垃圾桶，地球感謝你讓海洋更乾淨了一點。',
  '不看更新公告，還說你想玩遊戲？',
  '機率遊戲最討厭抽不到想要的，更討厭這遊戲明明是自己寫的運氣卻爛到不行 ╮(′～‵〞)╭',
  ':warning: 警告：本遊戲遊玩過程中並沒有任何動物實際受到傷害。',
  '寫這個遊戲還真的見識到了不少東西，比如說人類賭性堅強的一面',
  '「贏要衝、輸要梭哈」\n「小賭怡情、大賭尤加利葉」\n「有錢不賭愧對父母，賭光輸光為國爭光」\n「有賭有希望，沒錢有腎臟」',
  '喵PASS ~(*′△`)ﾉ',
  '你已經被 :doughnut:**幸運甜甜圈** 造訪，它對你的人生並不會帶來什麼改變。',
  '2019 年的我開始在 YouTube 上隨便亂逛，這是寫 Power87 時最常聽的頻道其中一首歌 <https://www.youtube.com/watch?v=BCt9lS_Uv_Y>',
  '「想要富，先下注。」—— Afei，2019',
  '「沒有孩子天天哭，哪家賭客天天輸？賭就對了。」—— Afei，2019',
  '*按一下以新增文字*',

  // dev
  '`hello, world`',
  '別著急，這遊戲才剛開始！（我還有很多點子還沒加進去）',
  '職業倦怠的開發者，假日都是這個形態 \\_(:3 」∠ )\\_',
  '好希望認識真正數學系的人幫我算期望值喔',
  '為了平衡一下每個指令用的程式碼行數，我決定增加這裡廢文ㄉ數量',
  '不知不覺這個專案也突破一千行程式碼了，每次更新後還能正常運作真是奇蹟',
  '找工作中的開發者，歡迎引薦 (`・ω・´)'
]

module.exports = (luck) => {
  if (luck) {
    return hints[luck] || -1
  }

  luck = Math.floor(Math.random() * hints.length)

  return hints[luck]
}
