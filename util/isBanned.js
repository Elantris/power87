const firebase = require('firebase')
const config = require('../config')
firebase.initializeApp(config.FIREBASE)
const database = firebase.database()

let allowlist = {}
let banlist = {}

database.ref('/allowlist').on('value', snapshot => {
  allowlist = snapshot.val()
})
database.ref('/banlist').on('value', snapshot => {
  banlist = snapshot.val()
})

module.exports = (snowflake) => {
  if (allowlist._activate && !allowlist[snowflake]) {
    return true
  }

  if (banlist[snowflake]) {
    return true
  }

  return false
}
