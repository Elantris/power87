const inventory = require('./inventory')
const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    database.ref(`/energy/${guildId}/${userId}`).set((snapshot.val() || INITIAL_USER_ENERGY) + 1)
  })
}

const fishingLootsChance = [
  [['0', 0.0001], ['1', 0.0005], ['2', 0.0005], ['3', 0.0010], ['4', 0.0015], ['5', 0.0020], ['6', 0.0020], ['11', 0.010], ['12', 0.015], ['13', 0.020], ['14', 0.025], ['15', 0.150], ['16', 0.50]],
  [['0', 0.0001], ['1', 0.0006], ['2', 0.0006], ['3', 0.0012], ['4', 0.0018], ['5', 0.0024], ['6', 0.0024], ['10', 0.010], ['11', 0.015], ['12', 0.020], ['13', 0.025], ['14', 0.150], ['15', 0.44], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0007], ['2', 0.0007], ['3', 0.0014], ['4', 0.0021], ['5', 0.0028], ['6', 0.0028], ['9', 0.010], ['10', 0.015], ['11', 0.020], ['12', 0.025], ['13', 0.150], ['14', 0.38], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0008], ['2', 0.0008], ['3', 0.0016], ['4', 0.0024], ['5', 0.0032], ['6', 0.0032], ['8', 0.010], ['9', 0.015], ['10', 0.020], ['11', 0.025], ['12', 0.150], ['13', 0.32], ['14', 0.01], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0009], ['2', 0.0009], ['3', 0.0018], ['4', 0.0027], ['5', 0.0036], ['6', 0.0036], ['7', 0.010], ['8', 0.015], ['9', 0.020], ['10', 0.025], ['11', 0.150], ['12', 0.26], ['13', 0.01], ['14', 0.01], ['15', 0.01], ['16', 0.01]]
]

const gainFromVoiceChannel = ({ client, banlist, database, fishing, energyVal, inventoryVal }) => {
  client.guilds.filter(guild => !banlist[guild.id]).tap(guild => {
    let guildId = guild.id

    let energyUpdates = {}
    let inventoryUpdates = {}

    guild.channels.filter(channel => channel.type === 'voice').tap(channel => {
      const isAFK = channel.name.startsWith('🔋')
      const isQualified = member => (isAFK && member.deaf && member.mute) || (!isAFK && !member.deaf && !member.mute)

      channel.members.filter(member => !banlist[member.id] && isQualified(member)).tap(member => {
        let userId = member.id

        if (fishing[guildId] && fishing[guildId][userId]) { // is fishing
          let userInventory = inventory.parseInventory(inventoryVal[guildId][member.id])
          if (!userInventory.hasEmptySlot || !userInventory.tools.$1) {
            return
          }

          let fishingPoleLevel = 1 + parseInt(userInventory.tools.$1) * 0.01 // fishing pole level
          let fishingPool = 0 // sailboat level
          if (userInventory.tools.$2) {
            fishingPool = parseInt(userInventory.tools.$2) + 1
          }

          let luck = Math.random()
          let loot = -1

          fishingLootsChance[fishingPool].some(item => {
            if (luck < item[1] * fishingPoleLevel) {
              loot = item[0]
              return true
            }
            luck -= item[1]
            return false
          })

          if (loot === -1) { // get nothing
            return
          }

          inventoryUpdates[userId] = inventoryVal[guildId][userId] + `,${loot}`
        } else {
          energyUpdates[userId] = (energyVal[guildId][userId] || INITIAL_USER_ENERGY) + 1
        }
      })
    })

    database.ref(`/energy/${guildId}`).update(energyUpdates)
    database.ref(`/inventory/${guildId}`).update(inventoryUpdates)
  })
}

module.exports = {
  INITIAL_USER_ENERGY,
  gainFromTextChannel,
  gainFromVoiceChannel
}
