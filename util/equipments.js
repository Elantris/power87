// * basic: kind, quality, name, icon, displayName, description
// * ability: blank, levelUp
// * special ability

module.exports = {
  0: {
    kind: 'weapon',
    quality: 'base',
    name: 'sword',
    icon: ':crossed_swords:',
    displayName: '初級長劍',
    description: '中規中矩的武器，是前線士兵常用的武器。',
    blank: [10, 5, 5],
    levelUp: [2, 1, 1]
  },
  1: {
    kind: 'weapon',
    quality: 'base',
    name: 'great-sword',
    icon: ':crossed_swords:',
    displayName: '初級大劍',
    description: '同時兼具鈍器與利器的組合，犧牲些許的速度換來更高的傷害。',
    blank: [13, 4, 4],
    levelUp: [2, 1, 1]
  },
  2: {
    kind: 'weapon',
    quality: 'base',
    name: 'hammer',
    icon: ':crossed_swords:',
    displayName: '初級鎚子',
    description: '完全攻擊特化的武器型態，同時捨棄命中與速度，就只為了吶喊一句：「吃我一鎚！」',
    blank: [15, 2, 2],
    levelUp: [2, 1, 1]
  },
  3: {
    kind: 'weapon',
    quality: 'base',
    name: 'crossbow',
    icon: ':crossed_swords:',
    displayName: '初級弩弓',
    description: '常見的遠程十字弓，能夠躲在遠處給予敵人致命的一擊。',
    blank: [12, 3, 6],
    levelUp: [2, 1, 1]
  },
  4: {
    kind: 'weapon',
    quality: 'base',
    name: 'bow',
    icon: ':crossed_swords:',
    displayName: '初級弓',
    description: '敏捷的弓箭手會裝備的武器，雖然命中率極低，依然能夠在戰場上造成敵人莫大的心理壓力。',
    blank: [13, 1, 7],
    levelUp: [2, 1, 1]
  },
  5: {
    kind: 'weapon',
    quality: 'base',
    name: 'blowgun',
    icon: ':crossed_swords:',
    displayName: '初級吹箭',
    description: '傳統的武器型態，雖然攻擊力與命中偏弱，但躲在暗處的偷襲能夠造成對方大量的傷害。',
    blank: [9, 4, 7],
    levelUp: [2, 1, 1]
  },
  6: {
    kind: 'weapon',
    quality: 'base',
    name: 'slingshot',
    icon: ':crossed_swords:',
    displayName: '初級彈弓',
    description: '小孩用來惡作劇時會用的道具，傷害跟命中都不怎麼樣。',
    blank: [7, 2, 9],
    levelUp: [2, 1, 1]
  },
  7: {
    kind: 'weapon',
    quality: 'base',
    name: 'scimitar',
    icon: ':crossed_swords:',
    displayName: '初級彎刀',
    description: '山賊愛用的武器之一，輕便的單手武器使用起來特別順手。',
    blank: [8, 6, 6],
    levelUp: [2, 1, 1]
  },
  8: {
    kind: 'weapon',
    quality: 'base',
    name: 'dagger',
    icon: ':crossed_swords:',
    displayName: '初級匕首',
    description: '輕盈小巧的暗殺利器，非常適合刺客執行秘密任務時攜帶。',
    blank: [6, 7, 7],
    levelUp: [2, 1, 1]
  },
  9: {
    kind: 'weapon',
    quality: 'base',
    name: 'katana',
    icon: ':crossed_swords:',
    displayName: '初級太刀',
    description: '來自日本的鋒利刀刃，能夠迅速斬殺敵人，持有太刀的戰士是戰場上不容輕視的對手',
    blank: [9, 7, 4],
    levelUp: [2, 1, 1]
  },
  10: {
    kind: 'weapon',
    quality: 'base',
    name: 'saber',
    icon: ':crossed_swords:',
    displayName: '初級軍刀',
    description: '利用靈巧的閃身與精確的刺撃對敵人造成紮實的傷害，以華麗戰鬥技巧著稱的武器。',
    blank: [7, 9, 2],
    levelUp: [2, 1, 1]
  },
  11: {
    kind: 'weapon',
    quality: 'base',
    name: 'stick',
    icon: ':crossed_swords:',
    displayName: '初級棍棒',
    description: '長柄武器的原始形態，是個容易上手的近戰武器。',
    blank: [12, 6, 3],
    levelUp: [2, 1, 1]
  },
  12: {
    kind: 'weapon',
    quality: 'base',
    name: 'spear',
    icon: ':crossed_swords:',
    displayName: '初級長槍',
    description: '一寸長、一寸強，犧牲了速度換來威風凜凜的架勢。',
    blank: [13, 7, 1],
    levelUp: [2, 1, 1]
  },
  1000: {
    kind: 'armor',
    quality: 'base',
    name: 'iron-armor',
    icon: ':shield:',
    displayName: '初級鐵製鎧甲',
    description: '常見的士兵鎧甲，似乎因為大量批發的緣故價格低廉，長年來都是軍營裡的標準配備。',
    blank: [10, 5, 3],
    levelUp: [2, 1, 1]
  },
  1001: {
    kind: 'armor',
    quality: 'base',
    name: 'heavy-armor',
    icon: ':shield:',
    displayName: '初級重型鎧甲',
    description: '防禦特化的鎧甲不躲也不藏，適合有勇氣擔當坦克的勇士穿著。',
    blank: [15, 1, 1],
    levelUp: [2, 1, 1]
  },
  1002: {
    kind: 'armor',
    quality: 'base',
    name: 'light-armor',
    icon: ':shield:',
    displayName: '初級輕型鎧甲',
    description: '犧牲厚重的裝甲，改以輕盈的身軀作為策略閃避敵人來勢洶洶的襲擊。',
    blank: [5, 7, 5],
    levelUp: [2, 1, 1]
  }
}
