const fs = require('fs')

const alias = require('../util/alias')
const tools = require('../util/tools')
const items = require('../util/items')
const findTargets = require('../util/findTargets')
const sendResponseMessage = require('../util/sendResponseMessage')

const encoding = 'utf8'

// * load manuals
let manuals = {}
fs.readdirSync('./manual/').filter(filename => filename.endsWith('.md')).forEach(filename => {
  let cmd = filename.split('.md')[0]
  manuals[cmd] = fs.readFileSync(`./manual/${cmd}.md`, { encoding })
})

module.exports = ({ args, message }) => {
  if (args.length === 1) {
    sendResponseMessage({ message, description: manuals.default })
    return
  }

  let search = args[1].toLowerCase()
  search = alias[search] || search

  // command manual
  if (manuals[search]) {
    sendResponseMessage({ message, description: manuals[search] })
    return
  }

  // tools and items
  let results = findTargets(search)

  if (results.length === 0) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  let description = ':diamond_shape_with_a_dot_inside: 道具/物品詳細說明'

  results.forEach(result => {
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
  })

  // response
  sendResponseMessage({ message, description })
}
