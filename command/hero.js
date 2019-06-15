const heroSystem = require('../util/heroSystem')
const sendResponseMessage = require('../util/sendResponseMessage')

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
  if (!userHero.name) {
    sendResponseMessage({ message, errorCode: 'ERROR_NO_HERO' })
    return
  }
  if (userHero.status === 'dead') {
    database.ref(`/hero/${guildId}/${userId}`).remove()
    sendResponseMessage({ message, errorCode: 'ERROR_HERO_DEAD' })
    return
  }

  // display hero info
  let description = `:scroll: ${message.member.displayName} 召喚的英雄\n\n` +
    `:${userHero.species}: **${userHero.name}** ${heroSystem.rarityDisplay(userHero.rarity)}\n\n` +
    `成長：**Lv.${userHero.level}** (${userHero.expPercent}%)\n` +
    `飽食度：${userHero.feed < 0 ? 0 : userHero.feed}/${userHero.maxFeed} (${userHero.feedPercent}%)\n` +
    `狀態：${statusDisplay(userHero.status)}\n`

  sendResponseMessage({ message, description: description })

  heroSystem.write(database, guildId, userId, userHero)
}
