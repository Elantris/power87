const inventorySystem = require('./inventorySystem')
const fishingSystem = require('./fishingSystem')
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
  let timenow = Date.now()

  client.guilds.filter(guild => !banlist[guild.id]).tap(async guild => {
    let guildId = guild.id

    let guildEnergy = await database.ref(`/energy/${guildId}`).once('value')
    let guildFishing = await database.ref(`/fishing/${guildId}`).once('value')
    guildEnergy = guildEnergy.val() || {}
    guildFishing = guildFishing.val() || {}
    let guildEnergyUpdates = {}
    let guildFishingUpdates = {}

    guild.members.filter(member => !banlist[member.id] && !member.user.bot).tap(async member => {
      let userId = member.id
      if (guildFishing[userId]) {
        if (!isQualified(member) && Math.random() < 0.8) {
          return
        }

        let fishingData = guildFishing[userId].split(';')
        let counts = fishingData[0].split(',').map(v => parseInt(v))
        guildFishingUpdates[userId] = fishingData[1]

        if (counts[0] + counts[1] < 120) {
          if (fishingData[1] && parseInt(fishingData[1]) > timenow) {
            counts[1]++
          } else {
            counts[0]++
          }

          guildFishingUpdates[userId] = counts.join(',') + ';' + guildFishingUpdates[userId]
        } else { // stop auto fishing
          let inventoryRaw = await database.ref(`/inventory/${guildId}/${userId}`).once('value')
          let userInventory = inventorySystem.parse(inventoryRaw.val() || '')

          let fishingRaw = `${counts[0]},${counts[1]};`
          fishingSystem({ database, guildId, userId, userInventory, fishingRaw })
          guildFishingUpdates[userId] = null
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
}

module.exports = {
  INITIAL_USER_ENERGY,
  gainFromTextChannel,
  gainFromVoiceChannel
}
