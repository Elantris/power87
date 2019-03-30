const moment = require('moment')
const Discord = require('discord.js')
const config = require('../config')

const hook = new Discord.WebhookClient(config.LoggerHook.id, config.LoggerHook.token)

// hook.send('I am now alive!')

module.exports = ({ message, guildId, userId }) => {
  let timeDisplay = moment(message.createdAt).format('HH:mm:ss')
  hook.send(`\`[${timeDisplay}]\` \`${guildId}\` / \`${message.channel.id}\`\n<@${userId}>: ${message.content}`)
}
