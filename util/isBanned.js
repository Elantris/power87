const guild = (allowlist, banlist, guildId) => {
  if (allowlist._activate && !allowlist[guildId]) {
    return true
  }

  if (banlist[guildId]) {
    return true
  }

  return false
}

const user = (banlist, snowflake) => {
  if (banlist[snowflake] && banlist[snowflake] > Date.now()) {
    return true
  }

  return false
}

module.exports = {
  guild,
  user
}
