const emoji = require('node-emoji')
const tools = require('./tools')
const items = require('./items')
const equipments = require('./equipments')

module.exports = search => {
  const results = []

  for (const id in tools) {
    if (
      search === tools[id].name ||
      search === emoji.emojify(tools[id].icon) ||
      emoji.unemojify(search) === tools[id].icon ||
      search === tools[id].displayName) {
      results.push({
        id,
        type: 'tool'
      })
    }
  }

  for (const id in items) {
    if (search === 'all' ||
      search === items[id].kind ||
      search === items[id].name ||
      search === emoji.emojify(items[id].icon) ||
      emoji.unemojify(search) === items[id].icon ||
      search === items[id].displayName) {
      results.push({
        id,
        type: 'item'
      })
    }
  }

  for (const id in equipments) {
    if (search === equipments[id].kind ||
      search === equipments[id].quality ||
      search === emoji.emojify(equipments[id].icon) ||
      emoji.unemojify(search) === equipments[id].icon ||
      search === equipments[id].name ||
      search === equipments[id].displayName) {
      results.push({
        id,
        type: 'equipment'
      })
    }
  }

  return results
}
