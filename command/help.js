const fs = require('fs')

const alias = require('../util/alias')
const sendResponseMessage = require('../util/sendResponseMessage')

const encoding = 'utf8'

// * load manuals
let manuals = {}
fs.readdirSync('./manual/').filter(filename => filename.endsWith('.md')).forEach(filename => {
  let cmd = filename.split('.md')[0]
  manuals[cmd] = fs.readFileSync(`./manual/${cmd}.md`, { encoding })
})

module.exports = async ({ args, client, database, message, guildId, userId }) => {
  if (args.length === 1) {
    sendResponseMessage({ message, description: manuals.default })
    return
  }

  let search = args[1].toLowerCase()
  search = alias[search] || search

  // command manual
  if (!manuals[search]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  sendResponseMessage({ message, description: manuals[search] })
}
