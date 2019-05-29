const emoji = require('node-emoji')
const tools = require('./tools')
const items = require('./items')

module.exports = search => {
  let results = []

  for (let id in tools) {
    if (search === 'all' ||
      search === tools[id].name ||
      search === tools[id].displayName ||
      search === emoji.emojify(tools[id].icon) ||
      emoji.unemojify(search) === tools[id].icon) {
      results.push({
        id,
        type: 'tool'
      })
    }
  }

  for (let id in items) {
    if (search === 'all' ||
      search === items[id].name ||
      search === items[id].displayName ||
      search === emoji.emojify(items[id].icon) ||
      emoji.unemojify(search) === items[id].icon) {
      results.push({
        id,
        type: 'item'
      })
    }
  }

  return results
}
