const fs = require('fs')
const emoji = require('node-emoji')

const alias = require('../util/alias')
const tools = require('../util/tools')
const items = require('../util/items')
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

  let description = ''
  let target = args[1].toLowerCase()
  target = alias[target] || target

  // command manual
  if (manuals[target]) {
    description = manuals[target]
    sendResponseMessage({ message, description })
    return
  }

  // tools and items
  description = ':diamond_shape_with_a_dot_inside: 道具/物品詳細說明'
  let targetNotFound = true

  for (let id in tools) {
    if (target === tools[id].name || target === emoji.emojify(tools[id].icon) || emoji.unemojify(target) === tools[id].icon || target === tools[id].displayName) {
      targetNotFound = false
      description += `\n\n${tools[id].icon}**${tools[id].displayName}**，\`${tools[id].name}\`` +
        `\n> 說明：${tools[id].description}` +
        `\n> 初始購買價格：:battery: **${tools[id].prices[0]}**，\`87!buy ${tools[id].name}\``
      break
    }
  }

  for (let id in items) {
    if (target === items[id].name || target === emoji.emojify(items[id].icon) || emoji.unemojify(target) === items[id].icon || target === items[id].displayName) {
      targetNotFound = false
      description += `\n\n${items[id].icon}**${items[id].displayName}**，\`${items[id].kind}/${items[id].name}\`` +
        `\n> 說明：${items[id].description}`

      if (items[id].maxStack) {
        description += `\n> 最大堆疊數量：**${items[id].maxStack}**`
      }
      if (items[id].price) {
        description += `\n> 購買價格：:battery: **${items[id].price}**，\`87!buy ${items[id].name}\``
      }
      if (items[id].value) {
        description += `\n> 販賣價格：:battery: **${items[id].value || 0}**，\`87!sell ${items[id].name}\``
      }
      if (items[id].duration) {
        description += `\n> 持續時間：**${items[id].duration / 60000}** 分鐘，\`87!use ${items[id].name}\``
      }
      if (items[id].feed) {
        description += `\n> 恢復飽食度：**+${items[id].feed}**，\`87!feed ${items[id].name}\``
      }
    }
  }

  if (targetNotFound) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  // response
  sendResponseMessage({ message, description })
}
