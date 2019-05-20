const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

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

  // display hero info
  let feedDisplay = (userHero.feed < 0 ? 0 : userHero.feed)
  sendResponseMessage({ message, description: `:scroll: ${message.member.displayName} 召喚的英雄\n\n:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}\n\n成長：**Lv.${userHero.level}** (${userHero.expPercent}%)\n飽食度：${feedDisplay}/${userHero.maxFeed} (${userHero.feedPercent}%)\n狀態：${heroSystem.statusDisplay(userHero.status)}` })

  database.ref(`/hero/${guildId}/${userId}`).set(heroSystem.make(userHero, message.createdTimestamp))
}
