const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, energy, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = INITIAL_USER_ENERGY
    }
    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + 1)
  })
}

const isQualified = member => member.voiceChannelID && !member.deaf

const gainFromVoiceChannel = ({ client, banlist, database }) => {
  let timenow = Date.now()

  client.guilds.filter(guild => !banlist[guild.id]).tap(guild => {
    let guildId = guild.id

    database.ref(`/energy/${guildId}`).once('value').then(snapshot => {
      let guildEnergy = snapshot.val() || {}
      let guildEnergyUpdates = {}

      database.ref(`/fishing/${guildId}`).once('value').then(snapshot => {
        let guildFishing = snapshot.val() || {}
        let guildFishingUpdates = {}

        guild.members.filter(member => !banlist[member.id] && !member.user.bot).tap(member => {
          let userId = member.id
          if (guildFishing[userId]) {
            let fishingData = guildFishing[userId].split(';')
            let counts = fishingData[0].split(',').map(v => parseInt(v))

            let hasBaitBuff = false
            if (fishingData[1] && parseInt([1]) > timenow) {
              hasBaitBuff = true
            }

            if (isQualified(member)) {
              if (hasBaitBuff) {
                counts[3]++
              } else {
                counts[2]++
              }
            } else {
              if (hasBaitBuff) {
                counts[1]++
              } else {
                counts[0]++
              }
            }

            guildFishingUpdates[userId] = counts.join(',') + ';'
            if (hasBaitBuff) {
              guildFishingUpdates[userId] += fishingData[1]
            }
          } else if (isQualified(member)) {
            if (typeof guildEnergy[userId] === 'undefined') {
              guildEnergy[userId] = INITIAL_USER_ENERGY
            }

            guildEnergyUpdates[userId] = guildEnergy[userId] + 1
          }
        })

        database.ref(`/energy/${guildId}`).update(guildEnergyUpdates)
        database.ref(`/fishing/${guildId}`).update(guildFishingUpdates)
      })
    })
  })
}

module.exports = {
  INITIAL_USER_ENERGY,
  gainFromTextChannel,
  gainFromVoiceChannel
}