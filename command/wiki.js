const tools = require('../util/tools')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
const sendResponseMessage = require('../util/sendResponseMessage')

module.exports = ({ args, message }) => {
  let results = findTargets(args[1].toLowerCase())

  if (results.length === 0) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  let description

  if (results.length > 1) {
    description = `:diamond_shape_with_a_dot_inside: 指定其中一種道具/物品：\n`
    results.forEach(result => {
      description += `\n${items[result.id].icon}**${items[result.id].displayName}**，\`${items[result.id].kind}/${items[result.id].name}\`，\`87!wiki ${items[result.id].name}\``
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

    if (items[result.id].price) {
      description += `\n> 購買價格：:battery: **${items[result.id].price}**，\`87!buy ${items[result.id].name}\``
    }
    if (items[result.id].value) {
      description += `\n> 販賣價格：:battery: **${items[result.id].value || 0}**，\`87!sell ${items[result.id].name}\``
    }
    if (items[result.id].duration) {
      description += `\n> 持續時間：**${items[result.id].duration / 60000}** 分鐘，\`87!use ${items[result.id].name}\``
    }
    if (items[result.id].feed) {
      description += `\n> 恢復飽食度：**+${items[result.id].feed}**，\`87!feed ${items[result.id].name}\``
    }
    if (items[result.id].content) {
      let content = items[result.id].content.split(',').map(v => {
        let itemData = v.split('.')
        return `${items[itemData[0]].icon}**${items[itemData[0]].displayName}**x${parseInt(itemData[1] || 1)}`
      }).join('、')
      description += `\n> 內容物：${content}，\`87!use ${items[result.id].name}\``
    }
  }

  // response
  sendResponseMessage({ message, description })
}
