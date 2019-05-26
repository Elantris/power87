const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

const energyCost = 50 // change hero name

const statusMapping = {
  starve: ['極度飢餓', '餓昏頭', '長期饑餓', '找不到東西吃', '需要主人的關愛'],
  hungry: ['肚子餓了', '想吃東西', '肚子還有點餓', '快給我吃的', '給我...吃...的...'],
  stay: ['閒置', '發呆', '空閑', '無聊', '站著', '坐著', '躺著'],
  work: ['工作中', '賣命工作中', '勤奮工作中', '為了錢工作中', '為了食物工作中']
}
const statusDisplay = (status) => {
  if (!statusMapping[status]) {
    return status
  }

  return statusMapping[status][Math.floor(Math.random() * statusMapping[status].length)]
}

module.exports = async ({ args, database, message, guildId, userId }) => {
  let userHero = await heroSystem.read(database, guildId, userId, message.createdTimestamp)
  if (!userHero) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_HERO' })
    return
  }

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
    sendResponseMessage({ message, description: `:scroll: ${message.member.displayName} 召喚的英雄\n\n:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}\n\n成長：**Lv.${userHero.level}** (${userHero.expPercent}%)\n飽食度：${feedDisplay}/${userHero.maxFeed} (${userHero.feedPercent}%)\n狀態：${statusDisplay(userHero.status)}` })
  }

  heroSystem.write(database, guildId, userId, userHero)
}
