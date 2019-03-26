module.exports = ({ database, message, guildId, userId }) => {
  database.ref(`/fishing/${guildId}/${userId}`).once('value').then(snapshot => {
    let isFishing
    if (!snapshot.exists()) {
      database.ref(`/fishing/${guildId}/${userId}`).set(1)
      isFishing = 1
    } else {
      database.ref(`/fishing/${guildId}/${userId}`).set(null)
      isFishing = 0
    }

    let fishingDisplay = [
      '結束釣魚',
      '開始釣魚'
    ]

    message.channel.send({
      embed: {
        color: 0xffe066,
        description: `:fishing_pole_and_fish: ${message.member.displayName} ${fishingDisplay[isFishing]}`
      }
    })
  })
}
