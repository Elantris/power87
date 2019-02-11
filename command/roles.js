const cooldown = {}

module.exports = ({ message, serverId }) => {
  if (cooldown[serverId]) {
    return
  }
  cooldown[serverId] = 1

  let members = {}
  message.guild.roles.array().forEach(role => {
    if (role.name === '@everyone') {
      return
    }
    members[role.name] = []
  })

  message.guild.members.array().forEach(member => {
    member.roles.array().forEach(role => {
      if (role.name === '@everyone') {
        return
      }
      members[role.name].push(member.displayName)
    })
  })

  let output = ``

  for (let i in members) {
    members[i].sort()
    output += `\n\n${i}:`
    for (let j in members[i]) {
      output += `\n${parseInt(j) + 1}. ${members[i][j]}`
    }
  }

  message.channel.send({
    embed: {
      color: 0xffe066,
      title: 'Members of Roles',
      description: output
    }
  })
}
