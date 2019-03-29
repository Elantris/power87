const inventory = require('./inventory')
const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    database.ref(`/energy/${guildId}/${userId}`).set((snapshot.val() || INITIAL_USER_ENERGY) + 1)
  })
}

const fishingLootsChance = [
  [['0', 0.0001], ['1', 0.0010], ['2', 0.0010], ['3', 0.0020], ['4', 0.0030], ['5', 0.0040], ['6', 0.0040], ['11', 0.02], ['12', 0.03], ['13', 0.04], ['14', 0.05], ['15', 0.15], ['16', 0.50]],
  [['0', 0.0002], ['1', 0.0015], ['2', 0.0015], ['3', 0.0030], ['4', 0.0045], ['5', 0.0060], ['6', 0.0060], ['10', 0.02], ['11', 0.03], ['12', 0.04], ['13', 0.05], ['14', 0.15], ['15', 0.45], ['16', 0.05]],
  [['0', 0.0003], ['1', 0.0020], ['2', 0.0020], ['3', 0.0040], ['4', 0.0060], ['5', 0.0080], ['6', 0.0080], ['9', 0.02], ['10', 0.03], ['11', 0.04], ['12', 0.05], ['13', 0.15], ['14', 0.45], ['15', 0.03], ['16', 0.01]],
  [['0', 0.0004], ['1', 0.0025], ['2', 0.0025], ['3', 0.0050], ['4', 0.0075], ['5', 0.0100], ['6', 0.0100], ['8', 0.02], ['9', 0.03], ['10', 0.04], ['11', 0.05], ['12', 0.15], ['13', 0.45], ['14', 0.01], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0005], ['1', 0.0030], ['2', 0.0030], ['3', 0.0060], ['4', 0.0060], ['5', 0.0120], ['6', 0.0120], ['7', 0.02], ['8', 0.03], ['9', 0.04], ['10', 0.05], ['11', 0.15], ['12', 0.45], ['13', 0.005], ['14', 0.005], ['15', 0.005], ['16', 0.005]]
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
