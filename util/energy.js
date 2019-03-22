const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    database.ref(`/energy/${guildId}/${userId}`).set((snapshot.val() || INITIAL_USER_ENERGY) + 1)
  })
}

const gainFromVoiceChannel = ({ client, banlist, database }) => {
  client.guilds.filter(guild => !banlist[guild.id]).tap(guild => {
    let guildId = guild.id

    database.ref(`/energy/${guildId}`).once('value').then(snapshot => {
      let guildEnergy = snapshot.val() || { _keep: 1 }
      let updates = {}

      guild.channels.filter(channel => channel.type === 'voice').tap(channel => {
        const isAFK = channel.name.startsWith('🔋')
        const isQualified = member => (isAFK && member.deaf && member.mute) || (!isAFK && !member.deaf && !member.mute)

        channel.members.filter(member => !banlist[member.id] && isQualified(member)).tap(member => {
          let userId = member.id
          updates[userId] = (guildEnergy[userId] || INITIAL_USER_ENERGY) + 1
        })
      })
      database.ref(`/energy/${guildId}`).update(updates)
    })
  })
}

module.exports = {
  INITIAL_USER_ENERGY,
  gainFromTextChannel,
  gainFromVoiceChannel
}
