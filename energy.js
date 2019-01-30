const inition = ({ cache, serverId, userId }) => {
  cache[serverId].energies[userId] = {
    amount: 50,
    lastMessage: 0
  }
}

const cooldownTime = {
  lastMessage: 2 * 60 * 1000, // 2 min
  voiceChannel: 6 * 60 * 1000 // 6 min
}

const gainFromMessage = ({ cache, serverId, userId }) => {
  let nowTime = Date.now()
  if (nowTime - cache[serverId].energies[userId].lastMessage > cooldownTime.lastMessage) {
    cache[serverId].energies[userId].amount += 1
    cache[serverId].energies[userId].lastMessage = Date.now()
  }
}

const gainFromVoiceChannel = ({ client, cache, serverExist }) => {
  setInterval(() => {
    client.guilds.array().forEach(guild => {
      let serverId = guild.id
      guild.channels.array().filter(channel => channel.type === 'voice').forEach(channel => {
        let members = channel.members.array()
        if (members.length === 0) {
          return
        }

        if (!cache[serverId]) {
          if (serverExist[serverId]) {
            cache[serverId] = require(`./data/${serverId}`)
          } else {
            cache[serverId] = {
              last: 0,
              responses: {},
              energies: {}
            }
          }
        }
        cache[serverId].last = Date.now()

        members.forEach(member => {
          let userId = member.id
          if (!cache[serverId].energies[userId]) {
            inition({ cache, serverId, userId })
          }
          cache[serverId].energies[userId].amount += 1
        })
      })
    })
  }, cooldownTime.voiceChannel)
}

module.exports = {
  inition,
  gainFromMessage,
  gainFromVoiceChannel
}
