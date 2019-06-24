const equipmentSystem = require('../util/equipmentSystem')
const tools = require('../util/tools')
const items = require('../util/items')
const equipments = require('../util/equipments')
const findTargets = require('../util/findTargets')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (!args[1]) {
    sendResponseMessage({ message, errorCode: 'ERROR_FORMAT' })
    return
  }

  let results = findTargets(args[1].toLowerCase())

  if (results.length === 0) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  let description

  if (results.length > 1) {
    description = `:diamond_shape_with_a_dot_inside: 指定其中一種道具/物品：\n`
    results.forEach(result => {
      if (result.type === 'item') {
        description += `\n${items[result.id].icon}**${items[result.id].displayName}**，\`87!wiki ${items[result.id].name}\``
      } else if (result.type === 'equipment') {
        description += `\n${equipments[result.id].icon}**${equipments[result.id].displayName}**，\`87!wiki ${equipments[result.id].name}\``
      }
    })
    sendResponseMessage({ message, description })
    return
  }

  description = ':diamond_shape_with_a_dot_inside: 道具/物品詳細說明'

  let result = results[0]
  if (result.type === 'tool') {
    description += `\n\n${tools[result.id].icon}**${tools[result.id].displayName}**，\`${tools[result.id].name}\`` +
      `\n> 說明：${tools[result.id].description}` +
      `\n> 購買價格：` +
      tools[result.id].prices.map((price, index) => `\`+${index}\`: **${price}**`).join('、') +
      `，\`87!buy ${tools[result.id].name}\``
  } else if (result.type === 'item') {
    description += `\n\n${items[result.id].icon}**${items[result.id].displayName}**，\`${items[result.id].kind}/${items[result.id].name}\`` +
      `\n> 說明：${items[result.id].description}` +
      `\n> 最大堆疊數量：**${items[result.id].maxStack}**`

    if ('price' in items[result.id]) {
      description += `\n> 購買價格：:battery: **${items[result.id].price}**，\`87!buy ${items[result.id].name}\``
    }
    if ('value' in items[result.id]) {
      description += `\n> 販賣價格：:battery: **${items[result.id].value || 0}**，\`87!sell ${items[result.id].name}\``
    }
    if ('duration' in items[result.id]) {
      description += `\n> 持續時間：**${items[result.id].duration / 60000}** 分鐘，\`87!use ${items[result.id].name}\``
    }
    if ('feed' in items[result.id]) {
      description += `\n> 恢復飽食度：**+${items[result.id].feed}**，\`87!feed ${items[result.id].name}\``
    }
    if ('content' in items[result.id]) {
      let content = items[result.id].content.split(',').map(v => {
        let itemData = v.split('.')
        return `${items[itemData[0]].icon}**${items[itemData[0]].displayName}**x${parseInt(itemData[1] || 1)}`
      }).join('、')
      description += `\n> 內容物：${content}，\`87!use ${items[result.id].name}\``
    }
  } else if (result.type === 'equipment') {
    let equipment = equipments[result.id]
    description += `\n\n${equipment.icon}**${equipment.displayName}**，\`${equipment.kind}/${equipment.name}\`` +
      `\n> 說明：${equipment.description}` +
      `\n> 品質：${equipmentSystem.qualityDisplay[equipment.quality]}` +
      `\n> 強化成功機率：${equipmentSystem.enhanceChances[equipment.quality].map(v => `\`${v * 100}%\``).join(', ')}`

    if (equipment.kind === 'weapon') {
      description += `\n> 基礎數值：\`ATK\`: ${equipment.blank[0]} / \`HIT\`: ${equipment.blank[1]} / \`SPD\`: ${equipment.blank[2]}` +
        `\n> 強化提升：\`ATK\`: ${equipment.levelUp[0]} / \`HIT\`: ${equipment.levelUp[1]} / \`SPD\`: ${equipment.levelUp[2]}`
    } else if (equipment.kind === 'armor') {
      description += `\n> 基礎數值：\`DEF\`: ${equipment.blank[0]} / \`EV\`: ${equipment.blank[1]} / \`SPD\`: ${equipment.blank[2]}` +
        `\n> 強化提升：\`DEF\`: ${equipment.levelUp[0]} / \`EV\`: ${equipment.levelUp[1]} / \`SPD\`: ${equipment.levelUp[2]}`
    }
  }

  // response
  sendResponseMessage({ message, description })
}
