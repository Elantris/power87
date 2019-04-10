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

  for (let id in tools) {
    if (target === tools[id].name || target === tools[id].icon || target === tools[id].displayName) {
      targetNotFound = false
      description += `\n\n${tools[id].icon}**${tools[id].displayName}**，${tools[id].description}`
      description += `\n初始購買價格：:battery: **${tools[id].prices[0]}**，\`87!buy ${tools[id].name}\``
      break
    }
  }

  for (let id in items) {
    if (target === items[id].name || target === items[id].icon || target === items[id].displayName) {
      targetNotFound = false
      description += `\n\n${items[id].icon}**${items[id].displayName}**，${items[id].description}\n物品分類：\`${items[id].kind}\``
      if (items[id].price) {
        description += `\n購買價格：:battery: **${items[id].price}**，\`87!buy ${items[id].name}\``
      }
      description += `\n販賣價格：:battery: **${items[id].value || 0}**，\`87!sell ${items[id].name}\``
    }
  }

  if (targetNotFound) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  sendResponseMessage({ message, description })
}
