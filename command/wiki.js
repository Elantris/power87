const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const equipments = require('../util/equipments')
const findTargets = require('../util/findTargets')

module.exports = async ({ args, database, message, guildId, userId }) => {
  let description

  if (args.length === 1 || args[1] === 'all') {
    description = `:diamond_shape_with_a_dot_inside: 指定一個種類：\n\n` +
      inventorySystem.kindOrders.map(kind => `${inventorySystem.kindNames[kind]}，\`87!wiki ${kind}\``).join('\n')
    return { description }
  }

  let results = findTargets(args[1].toLowerCase())

  if (results.length === 0) {
    return { errorCode: 'ERROR_NOT_FOUND' }
  }

  if (results.length > 1) {
    description = `:diamond_shape_with_a_dot_inside: 指定其中一種道具/物品：\n`
    results.forEach(result => {
      if (result.type === 'item') {
        description += `\n${items[result.id].icon}**${items[result.id].displayName}**，\`87!wiki ${items[result.id].name}\``
      } else if (result.type === 'equipment') {
        description += `\n${equipments[result.id].icon}**${equipments[result.id].displayName}**，\`87!wiki ${equipments[result.id].name}\``
      }
    })
    return { description }
  }

  description = ':diamond_shape_with_a_dot_inside: 道具/物品詳細說明'

  let result = results[0]
  if (result.type === 'tool') {
    let tool = tools[result.id]
    description += `\n\n${tool.icon}**${tool.displayName}**，\`${tool.name}\`` +
      `\n> 說明：${tool.description}` +
      `\n> 購買價格：` +
      tool.prices.map((price, index) => `\`+${index}\`: **${price}**`).join('、') +
      `，\`87!buy ${tool.name}\``
  } else if (result.type === 'item') {
    let item = items[result.id]
    description += `\n\n${item.icon}**${item.displayName}**，\`${item.kind}/${item.name}\`` +
      `\n> 說明：${item.description}` +
      `\n> 最大堆疊數量：**${item.maxStack}**`

    if ('price' in item) {
      description += `\n> 購買價格：:battery: **${item.price}**，\`87!buy ${item.name}\``
    }
    if ('value' in item) {
      description += `\n> 販賣價格：:battery: **${item.value || 0}**，\`87!sell ${item.name}\``
    }
    if ('duration' in item) {
      description += `\n> 持續時間：**${item.duration / 60000}** 分鐘，\`87!use ${item.name}\``
    }
    if ('feed' in item) {
      description += `\n> 恢復飽食度：**+${item.feed}**，\`87!feed ${item.name}\``
    }
    if ('content' in item) {
      let content = item.content.split(',').map(v => {
        let itemData = v.split('.')
        return `${items[itemData[0]].icon}**${items[itemData[0]].displayName}**x${parseInt(itemData[1] || 1)}`
      }).join('、')
      description += `\n> 內容物：${content}，\`87!use ${item.name}\``
    }
  } else if (result.type === 'equipment') {
    let equipment = equipments[result.id]
    description += `\n\n${equipment.icon}**${equipment.displayName}**，\`${equipment.kind}/${equipment.name}\`` +
      `\n> 說明：${equipment.description}`

    if (equipment.kind === 'weapon') {
      description += `\n> 基礎數值：\`ATK\`: ${equipment.blank[0]} / \`HIT\`: ${equipment.blank[1]} / \`SPD\`: ${equipment.blank[2]}` +
        `\n> 強化提升：\`ATK\`: ${equipment.levelUp[0]} / \`HIT\`: ${equipment.levelUp[1]} / \`SPD\`: ${equipment.levelUp[2]}`
    } else if (equipment.kind === 'armor') {
      description += `\n> 基礎數值：\`DEF\`: ${equipment.blank[0]} / \`EV\`: ${equipment.blank[1]} / \`SPD\`: ${equipment.blank[2]}` +
        `\n> 強化提升：\`DEF\`: ${equipment.levelUp[0]} / \`EV\`: ${equipment.levelUp[1]} / \`SPD\`: ${equipment.levelUp[2]}`
    }

    description += `\n> 強化機率：` +
      inventorySystem.enhanceChances[equipment.quality].map(v => `\`${Math.floor(v * 100)}%\``).join(', ')
  }

  // response
  return { description }
}
