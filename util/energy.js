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

const fishingLootsChance = {
  '0': [0.0001, 0.0001, 0.0001, 0.0001, 0.0001],

  '1': [0.0001, 0.0002, 0.0003, 0.0004, 0.0005],
  '2': [0.0001, 0.0002, 0.0003, 0.0004, 0.0005],
  '3': [0.0002, 0.0003, 0.0004, 0.0005, 0.0006],
  '4': [0.0005, 0.0006, 0.0007, 0.0008, 0.0009],
  '5': [0.0008, 0.0009, 0.0010, 0.0011, 0.0012],
  '6': [0.0010, 0.0011, 0.0012, 0.0013, 0.0014],

  '7': [0.0000, 0.0000, 0.0000, 0.0000, 0.0100],
  '8': [0.0000, 0.0000, 0.0000, 0.0100, 0.0110],
  '9': [0.0000, 0.0000, 0.0100, 0.0110, 0.0120],
  '10': [0.0000, 0.0100, 0.0110, 0.0120, 0.0130],
  '11': [0.0100, 0.0110, 0.0120, 0.0130, 0.0140],

  '12': [0.0100, 0.0200, 0.0400, 0.0800, 0.5800],
  '13': [0.0200, 0.0400, 0.0800, 0.6100, 0.0100],
  '14': [0.0400, 0.0800, 0.6400, 0.0100, 0.0100],
  '15': [0.0800, 0.6700, 0.0100, 0.0100, 0.0100],
  '16': [0.7000, 0.0100, 0.0100, 0.0010, 0.0100]
}

const userFishing = ({ guildInventory, guildInventoryUpdates, userId, fishingPool, multiplierNormal, multiplierRare }) => {
  let luck = Math.random()
  let loot = -1
  let multiplierTmp = 1

  for (let id in fishingLootsChance) {
    if (id === '1') {
      multiplierTmp = multiplierRare
    } else if (id === '6') {
      multiplierTmp = multiplierNormal
    }

    if (luck < fishingLootsChance[id][fishingPool] * multiplierTmp) {
      loot = id
      break
    }

    luck -= fishingLootsChance[id][fishingPool]
  }

  if (loot === -1) { // get nothing
    return
  }

  guildInventoryUpdates[userId] = (guildInventoryUpdates[userId] || guildInventory[userId]) + `,${loot}`
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

        let fishingPool = 0
        let multiplierNormal = 1 + parseInt(userInventory.tools.$1) * 0.01 // fishing pole
        let multiplierRare = multiplierNormal
        if (userInventory.tools.$2) { // sailboat
          fishingPool = parseInt(userInventory.tools.$2) + 1
        }
        if (userInventory.tools.$3) { // buoy
          multiplierRare += 0.01 + parseInt(userInventory.tools.$3)
        }

        userFishing({ guildInventory, guildInventoryUpdates, userId, fishingPool, multiplierNormal, multiplierRare })
        if (userInventory.buffs['%0'] && parseInt(userInventory.buffs['%0']) > timenow && Math.random() < 0.5) { // bait buff
          userFishing({ guildInventory, guildInventoryUpdates, userId, fishingPool, multiplierNormal, multiplierRare })
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
