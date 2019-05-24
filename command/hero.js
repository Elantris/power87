const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const energyCost = 50 // change hero name

module.exports = async ({ args, database, message, guildId, userId }) => {
  let heroRaw = await database.ref(`/hero/${guildId}/${userId}`).once('value')
  if (!heroRaw.exists()) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_HERO' })
    return
  }

  let userHero = heroSystem.parse(heroRaw.val(), message.createdTimestamp)
  if (userHero.status === 'dead') {
    database.ref(`/hero/${guildId}/${userId}`).remove()
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_DEAD' })
    return
  }

  if (args[1]) {
    // change hero name
    if (args[1].length > 20) {
      sendResponseMessage({ message, errorCode: 'ERROR_LENGTH_EXCEED' })
      return
    }

    // enery system
    let userEnergy = await database.ref(`/energy/${guildId}/${userId}`).once('value')
    userEnergy = userEnergy.val()
    if (!userEnergy || userEnergy < energyCost) {
      sendResponseMessage({ message, errorCode: 'ERROR_NO_ENERGY' })
      return
    }

    userHero.name = args[1]
    database.ref(`/hero/${guildId}/${userId}`).set(userEnergy - energyCost)
    sendResponseMessage({ message, description: `:scroll: ${message.member.displayName} 消耗 ${energyCost} 點八七能量，將召喚的英雄更名為 :${userHero.species}: **${userHero.name}**` })
  } else {
    // display hero info
    let feedDisplay = (userHero.feed < 0 ? 0 : userHero.feed)
    sendResponseMessage({ message, description: `:scroll: ${message.member.displayName} 召喚的英雄\n\n:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}\n\n成長：**Lv.${userHero.level}** (${userHero.expPercent}%)\n飽食度：${feedDisplay}/${userHero.maxFeed} (${userHero.feedPercent}%)\n狀態：${heroSystem.statusDisplay(userHero.status)}` })
  }

  database.ref(`/hero/${guildId}/${userId}`).set(heroSystem.make(userHero, message.createdTimestamp))
}
