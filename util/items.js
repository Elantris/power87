/*
 * basic: kind, name, icon, displayName, description, maxStack
 * currency: price, value
 * hero: feed
 * buff: buffId, duration
 * box: contains
 */

module.exports = {
  0: {
    kind: 'jewel',
    name: 'gem',
    icon: ':gem:',
    displayName: '鑽石',
    description: '非常具有價值的寶石，有些人會放在身上當作幸運物，不過大部分的人是買來炫耀自己的財富。',
    maxStack: 1,
    value: 1000
  },
  1: {
    kind: 'fishing',
    name: 'penguin',
    icon: ':penguin:',
    displayName: '企鵝',
    description: '雖然不曉得為什麼，在水裡游泳的企鵝好像禁不起魚餌的誘惑。',
    maxStack: 1,
    value: 500,
    feed: 500
  },
  2: {
    kind: 'fishing',
    name: 'whale',
    icon: ':whale:',
    displayName: '比較的大鯨魚',
    description: '這年頭竟然有人不知道大中天，難道是我老了嗎...？',
    maxStack: 1,
    value: 500,
    feed: 500
  },
  3: {
    kind: 'fishing',
    name: 'whale2',
    icon: ':whale2:',
    displayName: '鯨魚',
    description: '看看這隻生物的體型... 應該沒有人有力氣釣起來吧？',
    maxStack: 1,
    value: 300,
    feed: 300
  },
  4: {
    kind: 'fishing',
    name: 'shark',
    icon: ':shark:',
    displayName: '鯊魚',
    description: '海裡住著各式各樣的鯊魚，不過 Discord 只有這麼一個圖示可以用，將就一下吧。',
    maxStack: 1,
    value: 200,
    feed: 200
  },
  5: {
    kind: 'fishing',
    name: 'dolphin',
    icon: ':dolphin:',
    displayName: '海豚',
    description: '看哪！是海豚，不曉得牠會不會轉彎？',
    maxStack: 1,
    value: 100,
    feed: 100
  },
  6: {
    kind: 'fishing',
    name: 'octopus',
    icon: ':octopus:',
    displayName: '章魚',
    description: '雖然名字裡有個魚，不過實際上是軟體動物們頭足綱的生物。',
    maxStack: 1,
    value: 80,
    feed: 80
  },
  7: {
    kind: 'fishing',
    name: 'crocodile',
    icon: ':crocodile:',
    displayName: '鱷魚',
    description: '高級的漁獲。',
    maxStack: 1,
    value: 40,
    feed: 40
  },
  8: {
    kind: 'fishing',
    name: 'crab',
    icon: ':crab:',
    displayName: '螃蟹',
    description: '高級的漁獲。',
    maxStack: 1,
    value: 20,
    feed: 20
  },
  9: {
    kind: 'fishing',
    name: 'duck',
    icon: ':duck:',
    displayName: '鴨子',
    description: '高級的漁獲。',
    maxStack: 1,
    value: 15,
    feed: 15
  },
  10: {
    kind: 'fishing',
    name: 'turtle',
    icon: ':turtle:',
    displayName: '海龜',
    description: '高級的漁獲。。',
    maxStack: 1,
    value: 10,
    feed: 10
  },
  11: {
    kind: 'fishing',
    name: 'squid',
    icon: ':squid:',
    displayName: '烏賊',
    description: '高級的漁獲。',
    maxStack: 1,
    value: 7,
    feed: 7
  },
  12: {
    kind: 'fishing',
    name: 'blowfish',
    icon: ':blowfish:',
    displayName: '河豚',
    description: '常見的漁獲。',
    maxStack: 1,
    value: 5,
    feed: 5
  },
  13: {
    kind: 'fishing',
    name: 'tropical_fish',
    icon: ':tropical_fish:',
    displayName: '熱帶魚',
    description: '常見的漁獲。',
    maxStack: 1,
    value: 4,
    feed: 4
  },
  14: {
    kind: 'fishing',
    name: 'fish',
    icon: ':fish:',
    displayName: '魚',
    description: '常見的漁獲。',
    maxStack: 1,
    value: 3,
    feed: 3
  },
  15: {
    kind: 'fishing',
    name: 'frog',
    icon: ':frog:',
    displayName: '青蛙',
    description: '常見的漁獲。',
    maxStack: 1,
    value: 2,
    feed: 2
  },
  16: {
    kind: 'fishing',
    name: 'shrimp',
    icon: ':shrimp:',
    displayName: '蝦',
    description: '常見的漁獲。',
    maxStack: 1,
    value: 1,
    feed: 1
  },
  17: {
    kind: 'event',
    name: 'fakegem',
    icon: ':gem:',
    displayName: '[活動]愚人節的假鑽石',
    description: '2019/4/1 當天我忙完的時候已經 23:45 了，花了 6 分鐘緊急在物品列表裡加了一個應景的假鑽石，接著在每個背包裡面偷偷放進一顆，似乎騙到了不少人 ヽ( ° ▽°)ノ',
    maxStack: 1,
    value: 1
  },
  18: {
    kind: 'buff',
    name: 'bait',
    icon: ':bug:',
    displayName: '魚餌',
    description: '使用後一小時內減少釣魚時間，重複使用會延長時效。',
    maxStack: 5,
    value: 2,
    price: 20,
    buffId: '%0',
    duration: 3600000 // 1hr
  },
  19: {
    kind: 'buff',
    name: 'candy',
    icon: ':candy:',
    displayName: '好棒棒軟糖',
    description: '嚐起來有點甜膩的糖果，專門發給乖巧又懂事的小孩作為獎勵，據說吃下去後會變得比較幸運。',
    maxStack: 5,
    value: 1,
    price: 10,
    buffId: '%1',
    duration: 900000 // 15min
  },
  20: {
    kind: 'buff',
    name: 'lollipop',
    icon: ':lollipop:',
    displayName: '好運棒棒糖',
    description: '因為賭場裡面全面禁菸，賭客們為了裝帥會去購買的棒棒糖，因為他們相信吃下去會變得比較幸運。',
    maxStack: 5,
    value: 5,
    price: 50,
    buffId: '%2',
    duration: 900000
  },
  21: {
    kind: 'buff',
    name: 'chocolatebar',
    icon: ':chocolate_bar:',
    displayName: '巧克力好棒',
    description: '能夠迅速補充體力，適合那些在賭場裡流連忘返又不吃飯的賭客們。',
    maxStack: 5,
    value: 25,
    price: 250,
    buffId: '%3',
    duration: 900000
  },
  22: {
    kind: 'buff',
    name: 'popcorn',
    icon: ':popcorn:',
    displayName: '棒棒爆米花',
    description: '原本只是在一旁看戲的賭客吃下爆米花後運氣似乎變得特別好。',
    maxStack: 5,
    value: 125,
    price: 1250,
    buffId: '%4',
    duration: 900000
  },
  23: {
    kind: 'event',
    name: 'birthdaycake',
    icon: ':birthday:',
    displayName: '[活動]生日蛋糕',
    description: '5/4 是開發者的生日 ヽ( ° ▽°)ノ',
    maxStack: 1,
    value: 1000
  },
  24: {
    kind: 'petfood',
    name: 'cookie',
    icon: ':cookie:',
    displayName: '營養口糧',
    description: '《營養食品》生產能夠方便攜帶的餅乾。',
    maxStack: 1,
    value: 5,
    price: 50,
    feed: 25
  },
  25: {
    kind: 'petfood',
    name: 'riceball',
    icon: ':rice_ball:',
    displayName: '營養飯糰',
    description: '《營養食品》製造可以迅速補足英雄體力的飯糰。',
    maxStack: 1,
    value: 11,
    price: 110,
    feed: 50
  },
  26: {
    kind: 'petfood',
    name: 'sushi',
    icon: ':sushi:',
    displayName: '營養壽司',
    description: '《營養食品》推出能夠滿足英雄的口腹之慾的特等壽司。',
    maxStack: 1,
    value: 24,
    price: 240,
    feed: 100
  },
  27: {
    kind: 'petfood',
    name: 'bento',
    icon: ':bento:',
    displayName: '營養便當',
    description: '《營養食品》強力推薦菜色多元、豐富口感、多重層次的精緻便當，恢復全部英雄飽食度。',
    maxStack: 1,
    value: 50,
    price: 500,
    feed: 300
  },
  28: {
    kind: 'mark',
    name: 'stamp-feed',
    icon: ':heart:',
    displayName: '閃亮的印章-英雄飼養',
    description: '當英雄飽食度恢復時有機率獲得的印章，在英雄公會裡好像可以兌換些什麼。',
    maxStack: 1000,
    value: 10
  },
  29: {
    kind: 'mark',
    name: 'stamp-fight',
    icon: ':yellow_heart:',
    displayName: '閃亮的印章-英雄戰鬥',
    description: '英雄在戰鬥中勝利之後會獲得的印章，在英雄公會裡好像可以兌換些什麼。',
    maxStack: 1000,
    value: 10
  },
  30: {
    kind: 'mark',
    name: 'stamp-adventure',
    icon: ':green_heart:',
    displayName: '閃亮的印章-英雄冒險',
    description: '當英雄完成冒險時會獲得的印章，在英雄公會裡好像可以兌換些什麼。',
    maxStack: 1000,
    value: 10
  },
  31: {
    kind: 'mark',
    name: 'stamp-',
    icon: ':blue_heart:',
    displayName: '閃亮的印章-',
    description: '',
    maxStack: 1000,
    value: 10
  },
  32: {
    kind: 'mark',
    name: 'stamp-',
    icon: ':purple_heart:',
    displayName: '閃亮的印章-',
    description: '',
    maxStack: 1000,
    value: 10
  },
  33: {
    kind: 'event',
    name: 'bug-bounty',
    icon: ':gift:',
    displayName: '[活動]GM的禮物-除錯獎金',
    description: '感謝你幫忙找到 Power87 中任何一項錯誤！',
    maxStack: 1,
    value: 500
  },
  34: {
    kind: 'box',
    name: 'bait-box',
    icon: ':package:',
    displayName: '魚餌箱子',
    description: '一次購買十個魚餌享 85 折優惠！',
    maxStack: 1,
    price: 170,
    value: 17,
    content: '18.10'
  },
  35: {
    kind: 'box',
    name: 'candy-box',
    icon: ':package:',
    displayName: '糖果箱子',
    description: '《好棒食品》推出糖果禮包，讓賭客可以用優惠的價格買到更多好運。',
    maxStack: 1,
    price: 79,
    value: 7,
    content: '19.10'
  },
  36: {
    kind: 'event',
    name: 'lakiaro-celebration',
    icon: ':gift:',
    displayName: '[紀念]野生拉奇亞洛慶祝禮包',
    description: '慶祝 2019/6/11 開發者成功挖出原始的野生拉奇亞洛ヽ(✿ﾟ▽ﾟ)ノ',
    maxStack: 1,
    value: 11000
  },
  37: {
    kind: 'hero',
    name: 'summon-scroll',
    icon: ':scroll:',
    displayName: '英雄召喚捲軸',
    description: '蘊含神秘力量的卷軸，使用後會透過魔法陣從異世界隨機召喚一隻與你訂下契約的英雄。',
    maxStack: 1,
    price: 100,
    value: 10
  },
  38: {
    kind: 'hero',
    name: 'change-name',
    icon: ':label:',
    displayName: '英雄名稱變更券',
    description: '偶爾幫英雄換個稱呼或許會比較聽話。',
    maxStack: 1,
    price: 50,
    value: 5
  },
  39: {
    kind: 'hero',
    name: 'change-looks',
    icon: ':label:',
    displayName: '英雄外型變更券',
    description: '這隻英雄長得好奇怪，把他換成指定的外型好了。使用時請輸入 emoji 的名稱，例如 :rhino: -> `87!use change-looks rhino`，用 `87!help hero` 查看所有英雄的種族。',
    maxStack: 1,
    price: 3000,
    value: 300
  },
  40: {
    kind: 'enhance',
    name: 'enhance-rarity',
    icon: ':star:',
    displayName: '英雄星數強化石',
    description: '提升英雄星數所需要的特殊石頭。',
    maxStack: 32,
    price: 100,
    value: 10
  },
  41: {
    kind: 'buff',
    name: 'ice',
    icon: ':gem:',
    displayName: '冰塊',
    description: '雕刻成鑽石造型的冰塊，使用後可以暫時獲得冰涼的效果，適合在夏天享受短暫的愉悅。',
    maxStack: 10,
    price: 5,
    value: 0,
    buffId: '%5',
    duration: 60000
  },
  42: {
    kind: 'enhance',
    name: 'enhance-ability',
    icon: ':sparkles:',
    displayName: '英雄體質強化粉末',
    description: '具有神秘力量的不可思議粉末，能夠提升英雄各項體質。',
    maxStack: 50,
    price: 10,
    value: 1
  },
  43: {
    kind: 'hero',
    name: 'reset-ability',
    icon: ':pill:',
    displayName: '英雄體質重置藥丸',
    description: '使用後會將英雄的各項體質數值歸零。',
    maxStack: 1,
    price: 50,
    value: 5
  },
  44: {
    kind: 'equipment',
    name: 'base-weapon',
    icon: ':crossed_swords:',
    displayName: '初級英雄武器兌換券',
    description: '使用後可以隨機獲得一種初級英雄武器。',
    maxStack: 1,
    price: 100,
    value: 10
  },
  45: {
    kind: 'equipment',
    name: 'base-armor',
    icon: ':shield:',
    displayName: '初級英雄防具兌換券',
    description: '使用後可以隨機獲得一種初級英雄防具。',
    maxStack: 1,
    price: 100,
    value: 10
  },
  46: {
    kind: 'enhance',
    name: 'enhance-equipment',
    icon: ':sparkles:',
    displayName: '英雄裝備強化粉末',
    description: '具有神秘力量的不可思議粉末，能夠解放潛藏在裝備內的精靈之力，提高裝備的各項素質。',
    maxStack: 50,
    price: 50,
    value: 5
  },
  47: {
    kind: 'mark',
    name: 'frustrated-gambler',
    icon: ':broken_heart:',
    displayName: '失落的印章-迷惘的賭徒',
    description: '在賭博中失利時會獲得的印章，累積越多枚印章可以提高下次賭博贏得大獎的機率。',
    maxStack: 1000,
    value: 1
  },
  48: {
    kind: 'mark',
    name: 'frustrated-hero',
    icon: ':broken_heart:',
    displayName: '失落的印章-沮喪的英雄',
    description: '強化裝備失敗時會獲得的印章，累積越多枚印章可以提高下次強化成功的機率。',
    maxStack: 1000,
    value: 1
  }
}
