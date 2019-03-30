const Discord = require('discord.js')
const config = require('../config')

const hook = new Discord.WebhookClient(config.LoggerHook.id, config.LoggerHook.token)

// hook.send('I am now alive!')

module.exports = ({ message, guildId, userId }) => {
  hook.send(` \`${guildId}/${message.channel.id}\`\n\`${userId}\`: ${message.content}`)
}
