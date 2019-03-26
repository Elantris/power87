const INITIAL_USER_ENERGY = 50

const gainFromTextChannel = ({ database, guildId, userId }) => {
  database.ref(`/energy/${guildId}/${userId}`).once('value').then(snapshot => {
    database.ref(`/energy/${guildId}/${userId}`).set((snapshot.val() || INITIAL_USER_ENERGY) + 1)
  })
}

const gainFromVoiceChannel = ({ client, banlist, database, fishing }) => {
  client.guilds.filter(guild => !banlist[guild.id]).tap(guild => {
    let guildId = guild.id

    database.ref(`/energy/${guildId}`).once('value').then(snapshot => {
      let guildEnergy = snapshot.val() || {}
      let updates = {}

      guild.channels.filter(channel => channel.type === 'voice').tap(channel => {
        const isAFK = channel.name.startsWith('🔋')
        const isQualified = member => (isAFK && member.deaf && member.mute) || (!isAFK && !member.deaf && !member.mute)

        channel.members.filter(member => !banlist[member.id] && !(fishing[guildId] && fishing[guildId][member.id]) && isQualified(member)).tap(member => {
          let userId = member.id
          updates[userId] = (guildEnergy[userId] || INITIAL_USER_ENERGY) + 1
        })
      })
      database.ref(`/energy/${guildId}`).update(updates)
    })
  })
}

const inventory = require('./inventory')
const totalWeight = 2100

const autoFishing = ({ client, database, fishing }) => {
  for (let guildId in fishing) {
    database.ref(`/inventory/${guildId}`).once('value').then(snapshot => {
      let guildInventory = snapshot.val() || {}
      let updates = {}

      for (let userId in fishing[guildId]) {
        guildInventory[userId] = guildInventory[userId] || ''
        let userInventory = inventory.parseInventory(guildInventory[userId])
        if (!userInventory.hasEmptySlot || !userInventory.tools.$FishingPole) {
          continue
        }

        let luck = Math.random() * totalWeight
        let fish = -1
        for (let i in inventory.items) {
          if (luck < inventory.items[i].weight) {
            fish = i
            break
          }
          luck -= inventory.items[i].weight
        }
        if (inventory.items[fish].icon === 'trash') {
          console.log('trash')
          continue
        }

        userInventory.items.push({
          id: fish,
          amount: 1
        })
        updates[userId] = inventory.makeInventory(userInventory)
      }

      database.ref(`/inventory/${guildId}`).update(updates)
    })
  }
}

module.exports = {
  INITIAL_USER_ENERGY,
  gainFromTextChannel,
  gainFromVoiceChannel,
  autoFishing
}
