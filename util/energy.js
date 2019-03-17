const firebase = require('firebase')

let database = firebase.database()
let banlist = {}
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

const inition = ({ energies, userId }) => {
  energies[userId] = {
    a: 50 // amount
  }
}

const intervalTime = {
  voiceChannel: 6 * 60 * 1000 // 6 min
}

const gainFromVoiceChannel = ({ client, database }) => setInterval(() => {
  client.guilds.array().forEach(guild => {
    let serverId = guild.id
    database.ref(`/energies/${serverId}`).once('value').then(snapshot => {
      let energies = snapshot.val() || { _keep: 1 }

      guild.channels.array().forEach(channel => {
        if (channel.type !== 'voice') {
          return
        }

        let members = channel.members.array()
        if (members.length === 0) {
          return
        }

        const isAFK = channel.name.startsWith('🔋')
        const filter = member => (isAFK && member.deaf && member.mute) || (!isAFK && !member.deaf && !member.mute)

        members.forEach(member => {
          if (!filter || banlist[member.id]) {
            return
          }

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
