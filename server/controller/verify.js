const txtToJson = require('txt-to-json')
const User = require('../models/user')

exports.verifyUser = async function (req){
  console.log(req)

  const data = txtToJson(req)

  console.log(data)
  const googleId = data["id"]
  const sessionKey = data["session"]
  const familyId = data["id_family"]

  User.findOne({ id: googleId, session: sessionKey, id_family: familyId }).then(existingUser => {
    if (!existingUser) {
      return null, null
    }
    else {
      return googleId, familyId
    }
  })
}