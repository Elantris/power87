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
  client.guilds.filter(guild => !banlist[guild.id]).tap(guild => {
    let guildId = guild.id

    database.ref(`/energy/${guildId}`).once('value').then(snapshot => {
      let guildEnergy = snapshot.val() || {}
      let guildEnergyUpdates = {}

      guild.channels.filter(channel => channel.type === 'voice').tap(channel => {
        channel.members.filter(member => !banlist[member.id] && !member.user.bot && isQualified(member)).tap(member => {
          let userId = member.id
          if (fishing[guildId] && fishing[guildId][userId]) { // is fishing
            return
          }

          if (typeof guildEnergy[userId] === 'undefined') {
            guildEnergy[userId] = INITIAL_USER_ENERGY
          }

          guildEnergyUpdates[userId] = guildEnergy[userId] + 1
        })
      })

      database.ref(`/energy/${guildId}`).update(guildEnergyUpdates)
    })
  })
}

const fishingLootsChance = [
  [['0', 0.0001], ['1', 0.0003], ['2', 0.0003], ['3', 0.0005], ['4', 0.0007], ['5', 0.0010], ['6', 0.0010], ['11', 0.010], ['12', 0.010], ['13', 0.015], ['14', 0.020], ['15', 0.10], ['16', 0.60]],
  [['0', 0.0001], ['1', 0.0004], ['2', 0.0004], ['3', 0.0006], ['4', 0.0008], ['5', 0.0011], ['6', 0.0011], ['10', 0.010], ['11', 0.010], ['12', 0.015], ['13', 0.020], ['14', 0.11], ['15', 0.56], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0005], ['2', 0.0005], ['3', 0.0007], ['4', 0.0009], ['5', 0.0012], ['6', 0.0012], ['9', 0.010], ['10', 0.010], ['11', 0.015], ['12', 0.020], ['13', 0.12], ['14', 0.52], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0006], ['2', 0.0006], ['3', 0.0008], ['4', 0.0010], ['5', 0.0013], ['6', 0.0013], ['8', 0.010], ['9', 0.010], ['10', 0.015], ['11', 0.020], ['12', 0.13], ['13', 0.48], ['14', 0.01], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0007], ['2', 0.0007], ['3', 0.0009], ['4', 0.0011], ['5', 0.0014], ['6', 0.0014], ['7', 0.010], ['8', 0.010], ['9', 0.015], ['10', 0.020], ['11', 0.14], ['12', 0.44], ['13', 0.01], ['14', 0.01], ['15', 0.01], ['16', 0.01]]
]

const userFishing = ({ guildInventory, guildInventoryUpdates, userInventory, userId }) => {
  let fishingPool = 0
  if (userInventory.tools.$2) { // sailboat level
    fishingPool = parseInt(userInventory.tools.$2) + 1
  }

  let luck = Math.random()
  let loot = -1
  let multiplier = 1

  fishingLootsChance[fishingPool].some((item, index) => {
    if (index === 1) {
      multiplier = 1 + parseInt(userInventory.tools.$1) * 0.01 // fishing pole, buoy
      if (userInventory.tools.$3) {
        multiplier += 0.01 + parseInt(userInventory.tools.$3) * 0.01 // buoy
      }
    } else if (index === 6) {
      multiplier = 1 + parseInt(userInventory.tools.$1) * 0.01 // fishing pole
    }

    if (luck < item[1] * multiplier) {
      loot = item[0]
      return true
    }
    luck -= item[1]
    return false
  })

  if (loot === -1) { // get nothing
    return
  }

  guildInventoryUpdates[userId] = guildInventory[userId] + `,${loot}`
}

const autoFishing = ({ client, banlist, database, fishing }) => {
  let timenow = Date.now()
  client.guilds.filter(guild => !banlist[guild.id] && fishing[guild.id]).tap(guild => {
    let guildId = guild.id

    database.ref(`/inventory/${guildId}`).once('value').then(snapshot => {
      if (!snapshot.exists()) {
        return
      }

      let guildInventory = snapshot.val()
      let guildInventoryUpdates = {}

      guild.members.filter(member => !banlist[member.id] && !member.user.bot && fishing[guildId][member.id]).tap(member => {
        let userId = member.id
        if (typeof guildInventory[userId] === 'undefined') {
          return
        }

        if (!isQualified(member)) {
          if (Math.random() < 0.8) {
            return
          }
        }

        let userInventory = inventory.parseInventory(guildInventory[userId])
        if (!userInventory.hasEmptySlot || !userInventory.tools.$1) {
          return
        }

        userFishing({ guildInventory, guildInventoryUpdates, userInventory, userId })
        if (userInventory.buffs['%0'] && parseInt(userInventory.buffs['%0']) > timenow && Math.random() < 0.8) { // bait buff
          userFishing({ guildInventory, guildInventoryUpdates, userInventory, userId })
        }
      })

      database.ref(`/inventory/${guildId}`).update(guildInventoryUpdates)
    })
  })
}

module.exports = {
  INITIAL_USER_ENERGY,
  gainFromTextChannel,
  gainFromVoiceChannel,
  autoFishing
}
