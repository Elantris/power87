const fs = require('fs')
const emoji = require('node-emoji')
const alias = require('../util/alias')
const sendResponseMessage = require('../util/sendResponseMessage')
const tools = require('../util/tools')
const items = require('../util/items')
const encoding = 'utf8'

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
  let target = emoji.unemojify(args[1]).toLowerCase()
  target = alias[target] || target

  if (manuals[target]) {
    description = manuals[target]
    sendResponseMessage({ message, description })
    return
  }

  description = ':diamond_shape_with_a_dot_inside: 道具/物品詳細說明'
  let targetNotFound = true

  for (let toolId in tools) {
    if (target === tools[toolId].name || target === tools[toolId].icon || target === tools[toolId].displayName) {
      targetNotFound = false
      description += `\n\n${tools[toolId].icon} **${tools[toolId].displayName}**，${tools[toolId].description}`
      description += `\n初始購買價格：:battery: **${tools[toolId].prices[0]}**，\`87!buy ${tools[toolId].name}\``
      break
    }
  }

  for (let itemId in items) {
    if (target === items[itemId].name || target === items[itemId].icon || target === items[itemId].displayName) {
      targetNotFound = false
      description += `\n\n${items[itemId].icon} **${items[itemId].displayName}**，${items[itemId].description}`
      if (items[itemId].price) {
        description += `\n購買價格：:battery: **${items[itemId].price}**，\`87!buy ${items[itemId].name}\``
      }
      description += `\n販賣價格：:battery: **${items[itemId].value || 0}**`
    }
  }

  if (targetNotFound) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  sendResponseMessage({ message, description })
}
