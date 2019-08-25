const inventorySystem = require('../util/inventorySystem')
const tools = require('../util/tools')
const items = require('../util/items')
const equipments = require('../util/equipments')
const findTargets = require('../util/findTargets')

const wikiTemplate = `{TITLE}
{LIST}{DESCRIPTION}{MAX_STACK}{PRICE}{VALUE}{DURATION}{FEED}{CONTAINS}{ABILITY}{ENHANCE}{CHANCE}
`
const responseWrapper = (attrs) => {
  let description = wikiTemplate

  for (const i in attrs) {
    description = description.replace(`{${i}}`, attrs[i])
  }

  return {
    description
  }
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  const attrs = {
    TITLE: '',
    LIST: '',
    DESCRIPTION: '',
    MAX_STACK: '',
    PRICE: '',
    VALUE: '',
    DURATION: '',
    FEED: '',
    CONTAINS: '',
    ABILITY: '',
    ENHANCE: '',
    CHANCE: ''
  }

  if (args.length === 1 || args[1] === 'all') {
    attrs.TITLE = ':diamond_shape_with_a_dot_inside: Power87 資料庫：指定其中一個物品種類\n'
    attrs.LIST = inventorySystem.kindOrders.map(kind => `${inventorySystem.kindNames[kind]}，\`87!wiki ${kind}\``).join('\n')

    return responseWrapper(attrs)
  }

  const results = findTargets(args[1].toLowerCase())
  if (results.length === 0) {
    return { errorCode: 'ERROR_NOT_FOUND' }
  }

  if (results.length > 1) {
    attrs.TITLE = ':diamond_shape_with_a_dot_inside: Power87 資料庫：指定其中一個道具/物品\n'
    attrs.LIST = results.map(result => {
      let tmp
      if (result.type === 'tool') {
        tmp = tools
      } else if (result.type === 'item') {
        tmp = items
      } else if (result.type === 'equipment') {
        tmp = equipments
      }

      return `${tmp[result.id].icon}**${tmp[result.id].displayName}**，\`87!wiki ${tmp[result.id].name}\``
    }).join('\n')

    return responseWrapper(attrs)
  }

  const result = results[0]
  if (result.type === 'tool') {
    const tool = tools[result.id]

    attrs.TITLE = `${tool.icon}**${tool.displayName}**，\`tool/${tool.name}\``
    attrs.PRICE = `\n:small_blue_diamond: 購買價格：${tool.prices.map(price => `**${price}**`).join(', ')}，\`87!buy ${tool.name}\``
    attrs.DESCRIPTION = `\n:small_blue_diamond: 說明：${tool.description}`
  } else if (result.type === 'item') {
    const item = items[result.id]

    attrs.TITLE = `${item.icon}**${item.displayName}**，\`${item.kind}/${item.name}\``
    attrs.DESCRIPTION = `\n:small_blue_diamond: 說明：${item.description}`
    attrs.MAX_STACK = `\n:small_blue_diamond: 最大堆疊數量：**${item.maxStack}**`
    attrs.PRICE = item.price ? `\n:small_blue_diamond: 購買價格：:battery: **${item.price}**，\`87!buy ${item.name}\`` : ''
    attrs.VALUE = item.value ? `\n:small_blue_diamond: 販賣價格：:battery: **${item.value || 0}**，\`87!sell ${item.name}\`` : ''
    attrs.DURATION = item.duration ? `\n:small_blue_diamond: 持續時間：**${item.duration / 60000}** 分鐘，\`87!use ${item.name}\`` : ''
    attrs.FEED = item.feed ? `\n:small_blue_diamond: 恢復飽食度：**+${item.feed}**，\`87!feed ${item.name}\`` : ''
    attrs.CONTAINS = item.contains ? '\n:small_blue_diamond: 內容物：' + item.contains.split(',').map(v => {
      const itemData = v.split('.')
      return `${items[itemData[0]].icon}**${items[itemData[0]].displayName}**x${parseInt(itemData[1] || 1)}`
    }).join('、') : ''
  } else if (result.type === 'equipment') {
    const equipment = equipments[result.id]

    attrs.TITLE = `${equipment.icon}**${equipment.displayName}**，\`${equipment.kind}/${equipment.name}\``
    attrs.DESCRIPTION = `\n:small_blue_diamond: 說明：${equipment.description}`
    attrs.ABILITY = '\n:small_blue_diamond: 基礎數值：' + (equipment.kind === 'weapon'
      ? `\`ATK\`: ${equipment.blank[0]} / \`HIT\`: ${equipment.blank[1]} / \`SPD\`: ${equipment.blank[2]}`
      : `\`DEF\`: ${equipment.blank[0]} / \`EV\`: ${equipment.blank[1]} / \`SPD\`: ${equipment.blank[2]}`)
    attrs.ENHANCE = '\n:small_blue_diamond: 強化提升：' + (equipment.kind === 'weapon'
      ? `\`ATK\`: ${equipment.levelUp[0]} / \`HIT\`: ${equipment.levelUp[1]} / \`SPD\`: ${equipment.levelUp[2]}`
      : `\`DEF\`: ${equipment.levelUp[0]} / \`EV\`: ${equipment.levelUp[1]} / \`SPD\`: ${equipment.levelUp[2]}`)
    attrs.CHANCE = '\n:small_blue_diamond: 強化機率：' + inventorySystem.enhanceChances[equipment.quality].map(v => `\`${Math.floor(v * 100)}%\``).join(', ')
  }

  return responseWrapper(attrs)
}
