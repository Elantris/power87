const isBanned = require('./isBanned')

const inition = ({ energies, userId }) => {
  energies[userId] = {
    a: 50 // amount
  }
}

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energies/${guildId}`).once('value').then(snapshot => {
    let energies = snapshot.val() || { _keep: 1 }

    if (!energies[userId]) {
      inition({ energies, userId })
    }

    energies[userId].a += 1
    database.ref(`/energies/${guildId}`).update(energies)
  })
}

const gainFromVoiceChannel = ({ client, database }) => setInterval(() => {
  client.guilds.filter(guild => !isBanned(guild.id)).tap(guild => {
    let guildId = guild.id

    database.ref(`/energies/${guildId}`).once('value').then(snapshot => {
      let energies = snapshot.val() || { _keep: 1 }

      guild.channels.filter(channel => channel.type === 'voice').tap(channel => {
        const isAFK = channel.name.startsWith('🔋')
        const isQualified = member => (isAFK && member.deaf && member.mute) || (!isAFK && !member.deaf && !member.mute)

        channel.members.filter(member => !isBanned(member.id)).filter(isQualified).tap(member => {
          let userId = member.id
          if (!energies[userId]) {
            inition({ energies, userId })
          }
          energies[userId].a += 1
        })
      })

      database.ref(`/energies/${guildId}`).update(energies)
    })
  })
}, 6 * 60 * 1000) // 6 min

module.exports = {
  inition,
  gainFromTextChannel,
  gainFromVoiceChannel
}
