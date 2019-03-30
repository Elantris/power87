const fs = require('fs')
const alias = require('../util/alias')
const sendResponseMessage = require('../util/sendResponseMessage')
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

  let cmd = args[1].toLowerCase()
  cmd = alias[cmd] || cmd

  if (!manuals[cmd]) {
    sendResponseMessage({ message, errorCode: 'ERROR_NOT_FOUND' })
    return
  }

  sendResponseMessage({ message, description: manuals[cmd] })
}
