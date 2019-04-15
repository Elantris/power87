const tools = require('./tools')
const items = require('./items')

module.exports = search => {
  for (let id in tools) {
    if (search === tools[id].name || search === tools[id].icon || search === tools[id].displayName) {
      return {
        id,
        type: 'tool',
        price: tools[id].prices[0],
        level: 0
      }
    }
  }

  for (let id in items) {
    if (search === items[id].name || search === items[id].icon || search === items[id].displayName) {
      return {
        id,
        type: 'item',
        price: items[id].price
      }
    }
  }

  return {}
}
