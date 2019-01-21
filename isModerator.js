module.exports = ({ message }) => {
  let roles = message.member.roles.array()

  for (let i in roles) {
    if (roles[i].name.includes('87')) {
      return true
    }
  }
  return false
}
