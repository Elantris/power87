const inition = ({ energies, userId }) => {
  energies[userId] = {
    amount: 50,
    lastMessage: 0
  }
}

const cooldownTime = {
  lastMessage: 2 * 60 * 1000, // 2 min
  voiceChannel: 6 * 60 * 1000 // 6 min
}

const gainFromMessage = ({ energies, userId }) => {
  let nowTime = Date.now()
  if (nowTime - energies[userId].lastMessage > cooldownTime.lastMessage) {
    energies[userId].amount += 1
    energies[userId].lastMessage = nowTime
  }
}

const gainFromVoiceChannel = ({ client, database }) => setInterval(() => {
  client.guilds.array().forEach(guild => {
    let serverId = guild.id
    database.ref(`/energies/${serverId}`).once('value').then(snapshot => {
      let energies = snapshot.val() || { _keep: 1 }

      guild.channels.array().filter(channel => channel.type === 'voice').forEach(channel => {
        let members = channel.members.array()
        if (members.length === 0) {
          return
        }

        members.forEach(member => {
          let userId = member.id
          if (!energies[userId]) {
            inition({ energies, userId })
          }
          energies[userId].amount += 1
        })
      })

      database.ref(`/energies/${serverId}`).update(energies)
    })
  })
}, cooldownTime.voiceChannel)

module.exports = {
  inition,
  gainFromMessage,
  gainFromVoiceChannel
}
