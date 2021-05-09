const User = require('../models/user')

exports.verifyUser = async function (req){
  console.log(req)

  const googleId = req.data["id"]
  const sessionKey = req.data["session"]
  const familyId = req.data["id_family"]

  User.findOne({ id: googleId, session: sessionKey, id_family: familyId }).then(existingUser => {
    if (!existingUser) {
      return null, null
    }
    else {
      return googleId, familyId
    }
  })
}