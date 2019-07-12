const fs = require('fs')
const alias = require('../util/alias')
const encoding = 'utf8'

let manuals = {}
fs.readdirSync('./manual/').filter(filename => filename.endsWith('.md')).forEach(filename => {
  let cmd = filename.split('.md')[0]
  manuals[cmd] = fs.readFileSync(`./manual/${cmd}.md`, { encoding })
})

module.exports = async ({ args, database, message, guildId, userId }) => {
  if (args.length === 1) {
    return { description: manuals.default }
  }

  let search = args[1].toLowerCase()
  search = alias[search] || search

  if (!manuals[search]) {
    return { errorCode: 'ERROR_NOT_FOUND' }
  }

  return { description: manuals[search] }
}
