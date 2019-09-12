const tools = require('./tools')
const items = require('./items')

const hints = [
  // project, system
  '公告頁面的連結，這裡可以看到更新資訊！\n<https://hackmd.io/s/VkLSj2pOJW>',
  '意見調查的表單，有什麼話想對開發者說？\n<https://forms.gle/9iYELzNoQ2JRDKeR7>',
  '更新了「入門指南」，歡迎大家一起遊玩 Power87！\n<https://hackmd.io/@eelayntris/power87#入門指南>',

  // note
  '`add`、`delete`、`list` 這三個指令已進入歷史，我們懷念它們。',

  // energy
  '`87!daily` 每日簽到可以獲得固定點數，累積連續簽到達一定天數還可以獲得額外的獎勵點數',
  '`87!daily` 每個月都有累計的簽到獎勵',
  '`87!slot` 來試試手氣吧！',
  '`87!slot` 最高的獎勵是三顆鑽石 100 倍的八七能量',
  '`87!slot` 沒中獎的時候還是可以拿到 {{frustrated-gambler}}，累積越多可以提高下次中獎的機會',
  '`87!roll` 賭場裡多了骰子遊戲，贏錢的機率很高呢',
  '`87!give` 的交易手續費是 30%',
  '`87!rank` 每十分鐘更新一次能量排行榜',

  // inventory
  '`87!buy` 釣魚前需要先購買 {{bag}} 與 {{fishingpole}}',
  '`87!buy` 購買的增益道具會放進背包裡，記得使用 `87!use` 來獲得特殊效果',
  '為了避免賣掉不該賣的東西，`87!sell` 可以只賣掉特定分類的物品，例如 `87!sell fishing`',
  '{{fishingpole}} 等級越高越容易釣到魚',
  '提升 {{sailboat}} 等級可以解鎖更多種類的魚獲，說不定還可以看到 {{penguin}}',
  '{{sailboat}} 雖然很貴，但是可以大幅提高釣魚的獲利',
  '道具屋上架了 {{buoy}}，提升等級可以增加稀有魚種獲得的機率',
  '有非常低的機率可以釣到 {{gem}} 是很值錢的東西！',
  '{{bait}} 購買後會放進背包裡，記得使用 `87!use` 指令獲得增益效果',
  '你是不是把 {{bait}} 放在身上當護身符啊？',
  '「好運食品」對於點心的堅持一再推陳出新，據說賭客們吃了 {{lollipop}} 之後拉霸都拿一百倍。',
  '每個物品都有最大堆疊數量的限制，持有的物品過多會佔用更多的背包欄位',
  '箱子類型的物品使用後會獲得內容物，通常價格會有些折扣',
  '`87!use` 查看背包內可以使用的物品',
  '`87!buy` 商店裡陳列著裝備兌換券，{{base-weapon}}、{{base-armor}}，使用後可以隨機獲得一種初級裝備',

  // hero
  '從商店購買 {{summon-scroll}} 之後，`87!use summon-sroll 英雄名字` 就可以召喚出一隻英雄！',
  '`87!free` 如果不滿意自己的英雄可以考慮讓他回歸自由',
  '`87!feed` 查看背包內可以餵食英雄的食物，如果沒有在釣魚的話可以從商店買些吃的立即恢復營養',
  '商店裡有販售 {{change-name}}，使用後可以更換英雄的名字',
  '商店裡有販售 {{change-looks}}，使用後可以將英雄的外觀指定成喜歡的模樣，`87!help hero` 可以查看所有外觀',
  '英雄的稀有度每一顆星星會提升等級上限 10 等',
  '`87!enhance` 英雄的體質多寡會影響在戰鬥中的表現，`87!help hero` 查看各項能力的說明',
  '`87!enhance` 消耗 {{enhance-equipment}} 強化英雄裝備以提升素質',
  '`87!refine` 拆解背包內不要的裝備，等級越高的裝備可以拆出更多的 {{enhance-equipment}}',

  // other
  '接聽語音頻道可以獲得能量點數，進入釣魚模式有較高的機率釣到魚，但拒聽（關閉耳機圖示）視同未接聽語音頻道！',
  '遇到不知道用處的物品可以用 `87!help` 查看詳細說明',
  '`87!help` 是個很棒的指令，真希望每個人下指令前都先用一次',
  '`87!help` 是用來查詢87指令的，`87!wiki` 是用來查物品資訊的',
  '`87!wiki` 查詢 Power87 內出現過的道具和物品，可以用道具的圖示、種類、名稱、顯示名稱來查詢基本數值設定與功能詳細說明',
  '`87!hint` 可能會有一些攻略提示或是開發者的喃喃自語',

  // murmur
  '有空提醒旁邊的人背包滿了，趕快回來賣魚吧。',
  '釣到的垃圾會直接丟到旁邊的垃圾桶，地球感謝你讓海洋更乾淨了一點。',
  '不看更新公告，還說你想玩遊戲？',
  '機率遊戲最討厭抽不到想要的，更討厭這遊戲明明是自己寫的運氣卻爛到不行 ╮(′～‵〞)╭',
  ':warning: 警告：本遊戲遊玩過程中並沒有任何動物實際受到傷害。',
  '寫這個遊戲還真的見識到了不少東西，比如說人類賭性堅強的一面',
  '「贏要衝、輸要梭哈」\n「小賭怡情、大賭尤加利葉」\n「有錢不賭愧對父母，賭光輸光為國爭光」——Afei，2019',
  '喵PASS ~(*′△`)ﾉ',
  '你已經被 :doughnut:**幸運甜甜圈** 造訪，它對你的人生並不會帶來什麼改變。',
  '2019 年的我開始在 YouTube 上隨便亂逛，這是寫 Power87 時最常聽的頻道其中一首歌 <https://www.youtube.com/watch?v=BCt9lS_Uv_Y>',
  '「有賭有希望，沒錢有腎臟」—— 夜光，2019',
  '「想要富，先下注。」—— Afei，2019',
  '「沒有孩子天天哭，哪家賭客天天輸？賭就對了。」—— Afei，2019',
  '*按一下以新增文字*',
  '我成功挖到野生五階啦 {{lakiaro-celebration}}',

  // dev
  '`hello, world`',
  '別著急，這遊戲才剛開始！（我還有很多點子還沒加進去）',
  '職業倦怠的開發者，假日都是這個形態 \\_(:3 」∠ )\\_',
  '好希望認識真正數學系的人幫我算期望值喔',
  '為了平衡一下每個指令用的程式碼行數，我決定增加這裡廢文ㄉ數量',
  '不知不覺這個專案也突破一千行程式碼了，每次更新後還能正常運作真是奇蹟',
  '找到工作後回到家只想睡覺連黑沙都不想打開...',
  '每到週末無聊的時候才會來寫 Power87',
  '歡迎加入 eeBots Support！可以收到最新的更新資訊或是實際參與機器人的開發與製作～ https://discord.gg/Ctwz4BB'
]

const mapping = item => {
  for (const id in tools) {
    if (item === tools[id].name) {
      return `${tools[id].icon}**${tools[id].displayName}**`
    }
  }

  for (const id in items) {
    if (item === items[id].name) {
      return `${items[id].icon}**${items[id].displayName}**`
    }
  }

  return ''
}

module.exports = (luck) => {
  if (luck && !hints[luck - 1]) {
    return -1
  }

  if (!luck) {
    luck = Math.floor(Math.random() * hints.length) + 1
  }

  let hint = hints[luck - 1]
  const itemsNotation = hint.match(/\{\{[a-z\\-]*\}\}/g)
  if (itemsNotation) {
    itemsNotation.forEach(item => {
      hint = hint.replace(item, mapping(item.slice(2, -2)))
    })
  }

  return `[**Hint** \`${luck}/${hints.length}\`]\n` + hint
}
