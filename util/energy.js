const inventory = require('./inventory')
const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    let userEnergy = snapshot.val()
    if (!snapshot.exists()) {
      userEnergy = INITIAL_USER_ENERGY
    }
    database.ref(`/energy/${guildId}/${userId}`).set(userEnergy + 1)
  })
}

const isQualified = member => member.voiceChannelID && !member.deaf

const gainFromVoiceChannel = ({ client, banlist, database, fishing }) => {
  let timenow = Date.now()

  client.guilds.filter(guild => !banlist[guild.id]).tap(guild => {
    let guildId = guild.id

    database.ref(`/energy/${guildId}`).once('value').then(snapshot => {
      let guildEnergy = snapshot.val() || {}
      let guildEnergyUpdates = {}
      database.ref(`/inventory/${guildId}`).once('value').then(snapshot => {
        let guildInventory = snapshot.val() || {}
        let guildFishingUpdates = {}

        guild.members.filter(member => !banlist[member.id] && !member.user.bot).tap(member => {
          let userId = member.id
          if (fishing[guildId] && typeof fishing[guildId][userId] === 'number') {
            let userInventory = inventory.parseInventory(guildInventory[userId])

            if (!isQualified(member) && Math.random() < 0.8) {
              return
            }

            guildFishingUpdates[userId] = fishing[guildId][userId] + 1

            if (Math.random() < parseInt(userInventory.tools.$1) * 0.05) {
              guildFishingUpdates[userId] += 1 // fishing pole ability
            }
            if (userInventory.buffs['%0'] && parseInt(userInventory.buffs['%0']) > timenow && Math.random() < 0.5) {
              guildFishingUpdates[userId] += 1 // bait buff
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
