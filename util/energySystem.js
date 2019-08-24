const inventorySystem = require('./inventorySystem')
const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = async ({ database, energy, guildId, userId }) => {
  let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
  if (userEnergy.exists()) {
    userEnergy = userEnergy.val()
  } else {
    userEnergy = INITIAL_USER_ENERGY
  }
  database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + 1)
}

const isQualified = member => member.voiceChannelID && !member.deaf

const gainFromVoiceChannel = ({ client, banlist, database }) => {
  const timenow = Date.now()

  client.guilds.filter(guild => !banlist[guild.id]).tap(async guild => {
    const guildId = guild.id

    const guildEnergy = (await database.ref(`/energy/${guildId}`).once('value')).val() || {}
    const guildFishing = (await database.ref(`/fishing/${guildId}`).once('value')).val() || {}
    const guildEnergyUpdates = {}
    const guildFishingUpdates = {}

    guild.members.filter(member => !banlist[member.id] && !member.user.bot).tap(async member => {
      const userId = member.id

      if (isQualified(member)) {
        if (typeof guildEnergy[userId] === 'undefined') {
          guildEnergy[userId] = INITIAL_USER_ENERGY
        }

        guildEnergyUpdates[userId] = guildEnergy[userId] + 1
      }

      if (guildFishing[userId]) {
        if (!isQualified(member) && Math.random() < 0.5) {
          return
        }

        const fishingData = guildFishing[userId].split(';')
        const counts = fishingData[0].split(',').map(v => parseInt(v))

        if (counts[0] + counts[1] < 240) {
          if (fishingData[1] && parseInt(fishingData[1]) > timenow) {
            counts[1]++
          } else {
            counts[0]++
          }

          guildFishingUpdates[userId] = counts.join(',') + ';' + fishingData[1]
        } else { // stop auto fishing
          await inventorySystem.read(database, guildId, userId, timenow)
        }
      }
    })

    database.ref(`/energy/${guildId}`).update(guildEnergyUpdates)
    database.ref(`/fishing/${guildId}`).update(guildFishingUpdates)
  })
}

module.exports = {
  INITIAL_USER_ENERGY,
  gainFromTextChannel,
  gainFromVoiceChannel
}
