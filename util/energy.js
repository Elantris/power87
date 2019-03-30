const inventory = require('./inventory')
const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    database.ref(`/energy/${guildId}/${userId}`).set((snapshot.val() || INITIAL_USER_ENERGY) + 1)
  })
}

const fishingLootsChance = [
  [['0', 0.0001], ['1', 0.0010], ['2', 0.0010], ['3', 0.0020], ['4', 0.0030], ['5', 0.0040], ['6', 0.0040], ['11', 0.010], ['12', 0.018], ['13', 0.026], ['14', 0.034], ['15', 0.150], ['16', 0.50]],
  [['0', 0.0001], ['1', 0.0012], ['2', 0.0012], ['3', 0.0024], ['4', 0.0036], ['5', 0.0048], ['6', 0.0048], ['10', 0.010], ['11', 0.018], ['12', 0.026], ['13', 0.034], ['14', 0.150], ['15', 0.44], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0014], ['2', 0.0014], ['3', 0.0028], ['4', 0.0042], ['5', 0.0056], ['6', 0.0056], ['9', 0.010], ['10', 0.018], ['11', 0.026], ['12', 0.034], ['13', 0.150], ['14', 0.40], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0016], ['2', 0.0016], ['3', 0.0032], ['4', 0.0048], ['5', 0.0064], ['6', 0.0064], ['8', 0.010], ['9', 0.018], ['10', 0.026], ['11', 0.034], ['12', 0.150], ['13', 0.36], ['14', 0.01], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0018], ['2', 0.0018], ['3', 0.0036], ['4', 0.0054], ['5', 0.0072], ['6', 0.0072], ['7', 0.010], ['8', 0.018], ['9', 0.026], ['10', 0.034], ['11', 0.150], ['12', 0.32], ['13', 0.01], ['14', 0.01], ['15', 0.01], ['16', 0.01]]
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
