/*
 * basic: kind, name, icon, displayName, description, maxStack
 * currency: price, value
 * buff: buffId, duration
 * hero: feed
 * box: contains
 */

let itemsRaw = `id:String | kind:String | name:String | icon:String | displayName:String | maxStack:Number | price:Number | value:Number | buffId:String | duration:Number | feed:Number | contains:String | description:String

0 | jewel | gem | :gem: | 鑽石 | 1 | price | 1000 | buffId | duration | feed | contains | 非常具有價值的寶石，有些人會放在身上當作幸運物，不過大部分的人是買來炫耀自己的財富。
49 | jewel | shabby-moneybag | :moneybag: | 簡陋的錢袋 | 10 | 11 | 10 | buffId | duration | feed | contains | 非常破舊的錢袋，連當舖都不太想收購的東西。
50 | jewel | light-moneybag | :moneybag: | 輕盈的錢袋 | 10 | 101 | 100 | buffId | duration | feed | contains | 裡面裝了一點錢的錢袋。
51 | jewel | normal-moneybag | :moneybag: | 普通的錢袋 | 10 | 1010 | 1000 | buffId | duration | feed | contains | 這是一個帶出門可以支付一週生活費的錢袋。
52 | jewel | heavy-moneybag | :moneybag: | 沉重的錢袋 | 10 | 10100 | 10000 | buffId | duration | feed | contains | 感覺有點重量的錢袋。
53 | jewel | fadacai-moneybag | :moneybag: | 發大財錢袋 | 1 | price | 101000 | buffId | duration | feed | contains | 發大財！Power87 發大財！

1 | fishing | penguin | :penguin: | 企鵝 | 1 | price | 500 | buffId | duration | 500 | contains | 雖然不曉得為什麼，在水裡游泳的企鵝好像禁不起魚餌的誘惑。
2 | fishing | whale | :whale: | 比較的大鯨魚 | 1 | price | 500 | buffId | duration | 500 | contains | 這年頭竟然有人不知道大中天，難道是我老了嗎...？
3 | fishing | whale2 | :whale2: | 鯨魚 | 1 | price | 300 | buffId | duration | 300 | contains | 看看這隻生物的體型... 應該沒有人有力氣釣起來吧？
4 | fishing | shark | :shark: | 鯊魚 | 1 | price | 200 | buffId | duration | 200 | contains | 海裡住著各式各樣的鯊魚，不過 Discord 只有這麼一個圖示可以用，將就一下吧。
5 | fishing | dolphin | :dolphin: | 海豚 | 1 | price | 100 | buffId | duration | 100 | contains | 看哪！是海豚，不曉得牠會不會轉彎？
6 | fishing | octopus | :octopus: | 章魚 | 1 | price | 80 | buffId | duration | 80 | contains | 雖然名字裡有個魚，不過實際上是軟體動物們頭足綱的生物。
7 | fishing | crocodile | :crocodile: | 鱷魚 | 1 | price | 40 | buffId | duration | 40 | contains | 高級的漁獲。
8 | fishing | crab | :crab: | 螃蟹 | 1 | price | 20 | buffId | duration | 20 | contains | 高級的漁獲。
9 | fishing | duck | :duck: | 鴨子 | 1 | price | 15 | buffId | duration | 15 | contains | 高級的漁獲。
10 | fishing | turtle | :turtle: | 海龜 | 1 | price | 10 | buffId | duration | 10 | contains | 高級的漁獲。。
11 | fishing | squid | :squid: | 烏賊 | 1 | price | 7 | buffId | duration | 7 | contains | 高級的漁獲。
12 | fishing | blowfish | :blowfish: | 河豚 | 1 | price | 5 | buffId | duration | 5 | contains | 常見的漁獲。
13 | fishing | tropical_fish | :tropical_fish: | 熱帶魚 | 1 | price | 4 | buffId | duration | 4 | contains | 常見的漁獲。
14 | fishing | fish | :fish: | 魚 | 1 | price | 3 | buffId | duration | 3 | contains | 常見的漁獲。
15 | fishing | frog | :frog: | 青蛙 | 1 | price | 2 | buffId | duration | 2 | contains | 常見的漁獲。
16 | fishing | shrimp | :shrimp: | 瞎子 | 1 | price | 1 | buffId | duration | 1 | contains | 常見的漁獲。

17 | event | fakegem | :gem: | [活動]愚人節的假鑽石 | 1 | price | 1 | buffId | duration | feed | contains | 2019/4/1 當天我忙完的時候已經 23:45 了，花了 6 分鐘緊急在物品列表裡加了一個應景的假鑽石，接著在每個背包裡面偷偷放進一顆，似乎騙到了不少人 ヽ( ° ▽°)ノ
23 | event | birthdaycake | :birthday: | [活動]生日蛋糕 | 1 | price | 1000 | buffId | duration | feed | contains | 5/4 是開發者的生日 ヽ( ° ▽°)ノ
33 | event | bug-bounty | :gift: | [活動]GM的禮物-除錯獎金 | 1 | price | 500 | buffId | duration | feed | contains | 感謝你幫忙找到 Power87 中任何一項錯誤！
36 | event | lakiaro-celebration | :gift: | [紀念]野生拉奇亞洛慶祝禮包 | 1 | price | 11000 | buffId | duration | feed | contains | 慶祝 2019/6/11 開發者成功挖出原始的野生拉奇亞洛ヽ(✿ﾟ▽ﾟ)ノ

18 | buff | bait | :bug: | 魚餌 | 5 | 20 | 2 | %0 | 3600000 | 4 | contains | 使用後一小時內減少釣魚時間，重複使用會延長時效。
19 | buff | candy | :candy: | 好棒棒軟糖 | 5 | 10 | 1 | %1 | 900000 | 2 | contains | 嚐起來有點甜膩的糖果，專門發給乖巧又懂事的小孩作為獎勵，據說吃下去後會變得比較幸運。
20 | buff | lollipop | :lollipop: | 好運棒棒糖 | 5 | 50 | 5 | %2 | 900000 | 10 | contains | 因為賭場裡面全面禁菸，賭客們為了裝帥會去購買的棒棒糖，因為他們相信吃下去會變得比較幸運。
21 | buff | chocolatebar | :chocolate_bar: | 巧克力好棒 | 5 | 250 | 25 | %3 | 900000 | 50 | contains | 能夠迅速補充體力，適合那些在賭場裡流連忘返又不吃飯的賭客們。
22 | buff | popcorn | :popcorn: | 棒棒爆米花 | 5 | 1250 | 125 | %4 | 900000 | 250 | contains | 原本只是在一旁看戲的賭客吃下爆米花後運氣似乎變得特別好。
41 | buff | ice | :gem: | 冰塊 | 10 | 5 | 0 | %5 | 60000 | 1 | contains | 雕刻成鑽石造型的冰塊，使用後可以暫時獲得冰涼的效果，適合在夏天享受短暫的愉悅。

24 | petfood | cookie | :cookie: | 營養口糧 | 1 | 50 | 5 | buffId | duration | 25 | contains | 《營養食品》生產能夠方便攜帶的餅乾。
25 | petfood | riceball | :rice_ball: | 營養飯糰 | 1 | 110 | 11 | buffId | duration | 50 | contains | 《營養食品》製造可以迅速補足英雄體力的飯糰。
26 | petfood | sushi | :sushi: | 營養壽司 | 1 | 240 | 24 | buffId | duration | 100 | contains | 《營養食品》推出能夠滿足英雄的口腹之慾的特等壽司。
27 | petfood | bento | :bento: | 營養便當 | 1 | 500 | 50 | buffId | duration | 300 | contains | 《營養食品》強力推薦菜色多元、豐富口感、多重層次的精緻便當，恢復全部英雄飽食度。

28 | mark | stamp-feed | :heart: | 閃亮的印章-英雄飼養 | 1000 | price | 1 | buffId | duration | feed | contains | 當英雄飽食度恢復時有機率獲得的印章，在英雄公會裡好像可以兌換些什麼。
29 | mark | stamp-fight | :yellow_heart: | 閃亮的印章-英雄戰鬥 | 1000 | price | 1 | buffId | duration | feed | contains | 英雄在戰鬥中勝利之後會獲得的印章，在英雄公會裡好像可以兌換些什麼。
30 | mark | stamp-adventure | :green_heart: | 閃亮的印章-英雄冒險 | 1000 | price | 1 | buffId | duration | feed | contains | 英雄在冒險的旅途上偶爾會獲得的印章，在英雄公會裡好像可以兌換些什麼。
31 | mark | stamp-tower | :blue_heart: | 閃亮的印章-魔神之塔 | 1000 | price | 1 | buffId | duration | feed | contains | 英雄在魔神之塔闖關留下的紀錄證明，擁有越多印章可以指定要攻略的層數。
32 | mark | stamp-arena | :purple_heart: | 閃亮的印章-競技之王 | 1000 | price | 1 | buffId | duration | feed | contains | 英雄在競技場比賽中贏得勝利時會獲得的印章，是一個榮譽的象徵。
47 | mark | frustrated-gambler | :broken_heart: | 失落的印章-迷惘賭徒 | 1000 | price | 1 | buffId | duration | feed | contains | 在賭博中失利時會獲得的印章，累積越多枚印章可以提高下次贏得獎勵的機率。
48 | mark | frustrated-hero | :broken_heart: | 失落的印章-沮喪英雄 | 1000 | price | 1 | buffId | duration | feed | contains | 強化裝備失敗時會獲得的印章，累積越多枚印章可以提高下次強化成功的機率，強化成功時會全數回收。


34 | box | bait-box | :package: | 魚餌箱子 | 1 | 170 | 17 | buffId | duration | feed | 18.10 | 一次購買十個魚餌享 85 折優惠！
35 | box | candy-box | :package: | 糖果箱子 | 1 | 79 | 7 | buffId | duration | feed | 19.10 | 《好棒食品》推出糖果禮包，讓賭客可以用優惠的價格買到更多好運。

37 | hero | summon-scroll | :scroll: | 英雄召喚捲軸 | 1 | 100 | 10 | buffId | duration | feed | contains | 蘊含神秘力量的卷軸，使用後會透過魔法陣從異世界隨機召喚一隻與你訂下契約的英雄。\`87!use summon-scroll 英雄的名字\`
38 | hero | change-name | :label: | 英雄名稱變更券 | 1 | 50 | 5 | buffId | duration | feed | contains | 偶爾幫英雄換個稱呼或許會比較聽話。\`87!use change-name 英雄的名字\`
39 | hero | change-looks | :label: | 英雄外型變更券 | 1 | 3000 | 300 | buffId | duration | feed | contains | 這隻英雄長得好奇怪，把他換成指定的外型好了。使用時請輸入 emoji 的名稱，例如 :rhino: -> \`87!use change-looks rhino\`，用 \`87!help hero\` 查看所有英雄的種族。
43 | hero | reset-ability | :pill: | 英雄體質重置藥丸 | 1 | 50 | 5 | buffId | duration | feed | contains | 使用後會將英雄的各項體質數值歸零。

40 | enhance | enhance-rarity | :star: | 英雄星數強化石 | 32 | 100 | 10 | buffId | duration | feed | contains | 提升英雄星數所需要的特殊石頭。
42 | enhance | enhance-ability | :sparkles: | 英雄體質強化粉末 | 50 | 10 | 1 | buffId | duration | feed | contains | 具有神秘力量的不可思議粉末，能夠提升英雄各項體質。
46 | enhance | enhance-equipment | :sparkles: | 英雄裝備強化粉末 | 50 | 50 | 5 | buffId | duration | feed | contains | 具有神秘力量的不可思議粉末，能夠解放潛藏在裝備內的精靈之力，提高裝備的各項素質。

44 | equipment | base-weapon | :crossed_swords: | 初級英雄武器兌換券 | 1 | 100 | 10 | buffId | duration | feed | contains | 使用後可以隨機獲得一種初級英雄武器。
45 | equipment | base-armor | :shield: | 初級英雄防具兌換券 | 1 | 100 | 10 | buffId | duration | feed | contains | 使用後可以隨機獲得一種初級英雄防具。

id | kind | name | icon | displayName | maxStack | price | value | buffId | duration | feed | contains | description
`
// last item id: 53

let items = {}
let itemsData = itemsRaw.split('\n').filter(v => v)

let attrs = itemsData.shift().split(' | ').map(v => {
  let tmp = v.split(':')
  return {
    name: tmp[0],
    type: tmp[1]
  }
})

itemsData.forEach(v => {
  let id
  v.split(' | ').forEach((data, index) => {
    if (attrs[index].name === data) {
      return
    }
    if (index === 0) {
      id = data
      items[id] = {}
    } else {
      if (attrs[index].type === 'Number') {
        data = parseInt(data)
      }
      items[id][attrs[index].name] = data
    }
  })
})

// console.log(JSON.stringify(items))

module.exports = items
