const fs = require('fs')
const alias = require('../alias')
const encoding = 'utf8'

const manuals = {
  default: fs.readFileSync('./manual/default.md', { encoding }),
  add: fs.readFileSync('./manual/add.md', { encoding }),
  clean: fs.readFileSync('./manual/clean.md', { encoding }),
  del: fs.readFileSync('./manual/del.md', { encoding }),
  list: fs.readFileSync('./manual/list.md', { encoding }),
  vote: fs.readFileSync('./manual/vote.md', { encoding })
}

module.exports = ({ message, args }) => {
  if (args.length === 1) {
    message.channel.send(manuals.default)
    return
  }

  args[1] = args[1].toLowerCase()

  if (alias[args[1]]) {
    args[1] = alias[args[1]]
  }

  if (!manuals[args[1]]) {
    message.channel.send(':no_entry_sign: **無效指令**')
    return
  }
  message.channel.send(manuals[args[1]])
}
