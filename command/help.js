const fs = require('fs')
const alias = require('../alias')
const encoding = 'utf8'

let manuals = {}
fs.readdirSync('./manual/').filter(filename => filename.endsWith('.md')).forEach(filename => {
  let cmd = filename.split('.md')[0]
  manuals[cmd] = fs.readFileSync(`./manual/${cmd}.md`, { encoding })
})

module.exports = ({ message, args }) => {
  if (args.length === 1) {
    message.channel.send(manuals.default)
    return
  }

  let cmd = args[1].toLowerCase()
  cmd = alias[cmd] || cmd

  if (!manuals[cmd]) {
    message.channel.send(':no_entry_sign: **無效指令**')
    return
  }

  message.channel.send({
    embed: {
      color: 0xffe066,
      description: manuals[cmd]
    }
  })
}