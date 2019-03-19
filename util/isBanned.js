module.exports = (allowlist, banlist, snowflake) => {
  if (banlist[snowflake]) {
    return true
  }

  return false
}
