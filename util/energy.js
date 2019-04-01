const inventory = require('./inventory')
const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    database.ref(`/energy/${guildId}/${userId}`).set((snapshot.val() || INITIAL_USER_ENERGY) + 1)
  })
}

const fishingLootsChance = [
  [['0', 0.0001], ['1', 0.0003], ['2', 0.0003], ['3', 0.0005], ['4', 0.0007], ['5', 0.0010], ['6', 0.0010], ['11', 0.010], ['12', 0.010], ['13', 0.015], ['14', 0.020], ['15', 0.10], ['16', 0.60]],
  [['0', 0.0001], ['1', 0.0004], ['2', 0.0004], ['3', 0.0006], ['4', 0.0008], ['5', 0.0011], ['6', 0.0011], ['10', 0.010], ['11', 0.010], ['12', 0.015], ['13', 0.020], ['14', 0.11], ['15', 0.56], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0005], ['2', 0.0005], ['3', 0.0007], ['4', 0.0009], ['5', 0.0012], ['6', 0.0012], ['9', 0.010], ['10', 0.010], ['11', 0.015], ['12', 0.020], ['13', 0.12], ['14', 0.52], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0006], ['2', 0.0006], ['3', 0.0008], ['4', 0.0010], ['5', 0.0013], ['6', 0.0013], ['8', 0.010], ['9', 0.010], ['10', 0.015], ['11', 0.020], ['12', 0.13], ['13', 0.48], ['14', 0.01], ['15', 0.01], ['16', 0.01]],
  [['0', 0.0001], ['1', 0.0007], ['2', 0.0007], ['3', 0.0009], ['4', 0.0011], ['5', 0.0014], ['6', 0.0014], ['7', 0.010], ['8', 0.010], ['9', 0.015], ['10', 0.020], ['11', 0.14], ['12', 0.44], ['13', 0.01], ['14', 0.01], ['15', 0.01], ['16', 0.01]]
]

const gainFromVoiceChannel = ({ client, banlist, database, fishing, energyVal, inventoryVal }) => {
  client.guilds.filter(guild => !banlist[guild.id]).tap(guild => {
    let guildId = guild.id

    let energyUpdates = {}
    let inventoryUpdates = {}

    guild.channels.filter(channel => channel.type === 'voice').tap(channel => {
      const isAFK = channel.name.startsWith('🔋')
      const isQualified = member => (isAFK && member.deaf && member.mute) || (!isAFK && !member.deaf && !member.mute)

      channel.members.filter(member => !banlist[member.id] && !member.user.bot).tap(member => {
        let userId = member.id

        if (fishing[guildId] && fishing[guildId][userId]) { // is fishing
          let userInventory = inventory.parseInventory(inventoryVal[guildId][member.id])
          if (!userInventory.hasEmptySlot || !userInventory.tools.$1) {
            return
          }

          if (!isQualified(member)) {
            if (Math.random() < 0.5) {
              console.log('miss')
              return
            }
          }

          let fishingPoleLevel = 1 + parseInt(userInventory.tools.$1) * 0.01 // fishing pole level
          let fishingPool = 0
          if (userInventory.tools.$2) { // sailboat level
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

          console.log(luck)

          if (loot === -1) { // get nothing
            return
          }

          inventoryUpdates[userId] = inventoryVal[guildId][userId] + `,${loot}`
        } else if (isQualified(member)) {
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
