const inition = ({ energies, userId }) => {
  energies[userId] = {
    a: 50 // amount
  }
}

const intervalTime = {
  lastMessage: 2 * 60 * 1000, // 2 min
  voiceChannel: 6 * 60 * 1000 // 6 min
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

        members.filter(member => !(member.deaf || member.mute)).forEach(member => {
          let userId = member.id
          if (!energies[userId]) {
            inition({ energies, userId })
          }
          energies[userId].a += 1
        })
      })

      database.ref(`/energies/${serverId}`).update(energies)
    })
  })
}, intervalTime.voiceChannel)

module.exports = {
  inition,
  gainFromVoiceChannel
}
