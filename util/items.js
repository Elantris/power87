/*
 * basic: kind, name, icon, maxStack, displayName, description
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
    maxStack: 1,
    displayName: '鑽石',
    description: '非常具有價值的寶石，有些人會放在身上當作幸運物，不過大部分的人是買來炫耀自己的財富。',
    value: 1000
  },
  1: {
    kind: 'fishing',
    name: 'penguin',
    icon: ':penguin:',
    maxStack: 1,
    displayName: '企鵝',
    description: '雖然不曉得為什麼，在水裡游泳的企鵝好像禁不起魚餌的誘惑。',
    value: 500,
    feed: 500
  },
  2: {
    kind: 'fishing',
    name: 'whale',
    icon: ':whale:',
    maxStack: 1,
    displayName: '比較的大鯨魚',
    description: '這年頭竟然有人不知道大中天，難道是我老了嗎...？',
    value: 500,
    feed: 500
  },
  3: {
    kind: 'fishing',
    name: 'whale2',
    icon: ':whale2:',
    maxStack: 1,
    displayName: '鯨魚',
    description: '看看這隻生物的體型... 應該沒有人有力氣釣起來吧？',
    value: 300,
    feed: 300
  },
  4: {
    kind: 'fishing',
    name: 'shark',
    icon: ':shark:',
    maxStack: 1,
    displayName: '鯊魚',
    description: '海裡住著各式各樣的鯊魚，不過 Discord 只有這麼一個圖示可以用，將就一下吧。',
    value: 200,
    feed: 200
  },
  5: {
    kind: 'fishing',
    name: 'dolphin',
    icon: ':dolphin:',
    maxStack: 1,
    displayName: '海豚',
    description: '看哪！是海豚，不曉得牠會不會轉彎？',
    value: 100,
    feed: 100
  },
  6: {
    kind: 'fishing',
    name: 'octopus',
    icon: ':octopus:',
    maxStack: 1,
    displayName: '章魚',
    description: '雖然名字裡有個魚，不過實際上是軟體動物們頭足綱的生物。',
    value: 80,
    feed: 80
  },
  7: {
    kind: 'fishing',
    name: 'crocodile',
    icon: ':crocodile:',
    maxStack: 1,
    displayName: '鱷魚',
    description: '高級的漁獲。',
    value: 40,
    feed: 40
  },
  8: {
    kind: 'fishing',
    name: 'crab',
    icon: ':crab:',
    maxStack: 1,
    displayName: '螃蟹',
    description: '高級的漁獲。',
    value: 20,
    feed: 20
  },
  9: {
    kind: 'fishing',
    name: 'duck',
    icon: ':duck:',
    maxStack: 1,
    displayName: '鴨子',
    description: '高級的漁獲。',
    value: 15,
    feed: 15
  },
  10: {
    kind: 'fishing',
    name: 'turtle',
    icon: ':turtle:',
    maxStack: 1,
    displayName: '海龜',
    description: '高級的漁獲。。',
    value: 10,
    feed: 10
  },
  11: {
    kind: 'fishing',
    name: 'squid',
    icon: ':squid:',
    maxStack: 1,
    displayName: '烏賊',
    description: '高級的漁獲。',
    value: 7,
    feed: 7
  },
  12: {
    kind: 'fishing',
    name: 'blowfish',
    icon: ':blowfish:',
    maxStack: 1,
    displayName: '河豚',
    description: '常見的漁獲。',
    value: 5,
    feed: 5
  },
  13: {
    kind: 'fishing',
    name: 'tropical_fish',
    icon: ':tropical_fish:',
    maxStack: 1,
    displayName: '熱帶魚',
    description: '常見的漁獲。',
    value: 4,
    feed: 4
  },
  14: {
    kind: 'fishing',
    name: 'fish',
    icon: ':fish:',
    maxStack: 1,
    displayName: '魚',
    description: '常見的漁獲。',
    value: 3,
    feed: 3
  },
  15: {
    kind: 'fishing',
    name: 'frog',
    icon: ':frog:',
    maxStack: 1,
    displayName: '青蛙',
    description: '常見的漁獲。',
    value: 2,
    feed: 2
  },
  16: {
    kind: 'fishing',
    name: 'shrimp',
    icon: ':shrimp:',
    maxStack: 1,
    displayName: '蝦',
    description: '常見的漁獲。',
    value: 1,
    feed: 1
  },
  17: {
    kind: 'event',
    name: 'fakegem',
    icon: ':gem:',
    maxStack: 1,
    displayName: '[活動]愚人節的假鑽石',
    description: '2019/4/1 當天我忙完的時候已經 23:45 了，花了 6 分鐘緊急在物品列表裡加了一個應景的假鑽石，接著在每個背包裡面偷偷放進一顆，似乎騙到了不少人 ヽ( ° ▽°)ノ',
    value: 1
  },
  18: {
    kind: 'buff',
    name: 'bait',
    icon: ':bug:',
    maxStack: 5,
    displayName: '魚餌',
    description: '使用後一小時內減少釣魚時間，重複使用會延長時效。',
    value: 2,
    price: 20,
    buffId: '%0',
    duration: 3600000 // 1hr
  },
  19: {
    kind: 'buff',
    name: 'candy',
    icon: ':candy:',
    maxStack: 5,
    displayName: '好棒棒軟糖',
    description: '嚐起來有點甜膩的糖果，專門發給乖巧又懂事的小孩作為獎勵，據說吃下去後會變得比較幸運。',
    value: 1,
    price: 10,
    buffId: '%1',
    duration: 900000 // 15min
  },
  20: {
    kind: 'buff',
    name: 'lollipop',
    icon: ':lollipop:',
    maxStack: 5,
    displayName: '好運棒棒糖',
    description: '因為賭場裡面全面禁菸，賭客們為了裝帥會去購買的棒棒糖，因為他們相信吃下去會變得比較幸運。',
    value: 5,
    price: 50,
    buffId: '%2',
    duration: 900000
  },
  21: {
    kind: 'buff',
    name: 'chocolatebar',
    icon: ':chocolate_bar:',
    maxStack: 5,
    displayName: '巧克力好棒',
    description: '能夠迅速補充體力，適合那些在賭場裡流連忘返又不吃飯的賭客們。',
    value: 25,
    price: 250,
    buffId: '%3',
    duration: 900000
  },
  22: {
    kind: 'buff',
    name: 'popcorn',
    icon: ':popcorn:',
    maxStack: 5,
    displayName: '棒棒爆米花',
    description: '原本只是在一旁看戲的賭客吃下爆米花後運氣似乎變得特別好。',
    value: 125,
    price: 1250,
    buffId: '%4',
    duration: 900000
  },
  23: {
    kind: 'event',
    name: 'birthdaycake',
    icon: ':birthday:',
    maxStack: 1,
    displayName: '生日蛋糕',
    description: '5/4 是開發者的生日 ヽ( ° ▽°)ノ',
    value: 1000
  },
  24: {
    kind: 'petfood',
    name: 'cookie',
    icon: ':cookie:',
    maxStack: 1,
    displayName: '營養口糧',
    description: '《營養食品》生產能夠方便攜帶的餅乾。',
    value: 5,
    price: 50,
    feed: 25
  },
  25: {
    kind: 'petfood',
    name: 'riceball',
    icon: ':rice_ball:',
    maxStack: 1,
    displayName: '營養飯糰',
    description: '《營養食品》製造可以迅速補足英雄體力的飯糰。',
    value: 11,
    price: 110,
    feed: 50
  },
  26: {
    kind: 'petfood',
    name: 'sushi',
    icon: ':sushi:',
    maxStack: 1,
    displayName: '營養壽司',
    description: '《營養食品》推出能夠滿足英雄的口腹之慾的特等壽司。',
    value: 24,
    price: 240,
    feed: 100
  },
  27: {
    kind: 'petfood',
    name: 'bento',
    icon: ':bento:',
    maxStack: 1,
    displayName: '營養便當',
    description: '《營養食品》強力推薦菜色多元、豐富口感、多重層次的精緻便當，恢復全部英雄飽食度。',
    value: 50,
    price: 500,
    feed: 300
  },
  28: {
    kind: 'mark',
    name: 'stamp-feed',
    icon: ':heart:',
    maxStack: 10000,
    displayName: '閃亮的印章-英雄飼養',
    description: '當英雄飽食度恢復時有機率獲得的印章，似乎可以賣個好價錢。',
    value: 10
  },
  29: {
    kind: 'mark',
    name: 'stamp-adventure',
    icon: ':yellow_heart:',
    maxStack: 1000,
    displayName: '閃亮的印章-英雄冒險',
    description: '',
    value: 50
  },
  30: {
    kind: 'mark',
    name: 'stamp-',
    icon: ':green_heart:',
    maxStack: 1000,
    displayName: '閃亮的印章-',
    description: '',
    value: 0
  },
  31: {
    kind: 'mark',
    name: 'stamp-',
    icon: ':blue_heart:',
    maxStack: 1000,
    displayName: '閃亮的印章-',
    description: '',
    value: 0
  },
  32: {
    kind: 'mark',
    name: 'stamp-',
    icon: ':purple_heart:',
    maxStack: 1000,
    displayName: '閃亮的印章-',
    description: '',
    value: 0
  },
  33: {
    kind: 'event',
    name: 'bug-bounty',
    icon: ':gift:',
    maxStack: 1,
    displayName: 'GM的禮物-除錯獎金',
    description: '感謝你幫忙找到 Power87 中任何一項錯誤！',
    value: 500
  },
  34: {
    kind: 'box',
    name: 'bait-box',
    icon: ':package:',
    maxStack: 1,
    displayName: '魚餌箱子',
    description: '一次購買十個魚餌享 85 折優惠！',
    price: 170,
    value: 17,
    content: '18.10'
  },
  35: {
    kind: 'box',
    name: 'candy-box',
    icon: ':package:',
    maxStack: 1,
    displayName: '糖果箱子',
    description: '《好棒食品》推出糖果禮包，讓賭客可以用優惠的價格買到更多好運。',
    price: 79,
    value: 7,
    content: '19.10'
  },
  36: {
    kind: 'event',
    name: 'lakiaro-celebration',
    icon: ':gift:',
    maxStack: 1,
    displayName: '野生拉奇亞洛慶祝禮包',
    description: '慶祝 2019/6/11 開發者成功挖出原始的野生拉奇亞洛ヽ(✿ﾟ▽ﾟ)ノ',
    value: 11000
  },
  37: {
    kind: 'hero',
    name: 'summon-scroll',
    icon: ':scroll:',
    maxStack: 1,
    displayName: '英雄召喚捲軸',
    description: '蘊含神秘力量的卷軸，使用後會透過魔法陣從異世界隨機召喚一隻與你訂下契約的英雄。',
    price: 100,
    value: 10
  },
  38: {
    kind: 'hero',
    name: 'change-name',
    icon: ':label:',
    maxStack: 1,
    displayName: '英雄名稱變更券',
    description: '偶爾幫英雄換個稱呼或許會比較聽話。',
    price: 50,
    value: 5
  },
  39: {
    kind: 'hero',
    name: 'change-looks',
    icon: ':label:',
    maxStack: 1,
    displayName: '英雄外型變更券',
    description: '這隻英雄長得好奇怪，把他換成指定的外型好了。使用時請輸入 emoji 的名稱，例如 :rhino: -> `87!use change-looks rhino`，用 `87!help hero` 查看所有英雄的種族。',
    price: 3000,
    value: 300
  },
  40: {
    kind: 'enhance',
    name: 'enhance-rarity',
    icon: ':star:',
    maxStack: 32,
    displayName: '英雄星數強化石',
    description: '提升英雄星數所需要的石頭。',
    price: 100,
    value: 10
  },
  41: {
    kind: 'buff',
    name: 'ice',
    icon: ':gem:',
    maxStack: 10,
    displayName: '冰塊',
    description: '雕刻成鑽石造型的冰塊，使用後可以暫時獲得冰涼的效果，適合在夏天享受短暫的愉悅。',
    price: 5,
    value: 0,
    buffId: '%5',
    duration: 60000
  }
}
