const User = require('../models/user')

exports.verifyUser = async function (req){
  const data = JSON.parse(req.data)
  console.log(data)

  const googleId = data["id"]
  const sessionKey = data["session"]
  const familyId = data["id_family"]

  User.findOne({ id: googleId, session: sessionKey, id_family: familyId }).then(existingUser => {
    if (!existingUser) {
      googleId = null
      familyId = null
    }
  })
  return [String(googleId), String(familyId)]
}