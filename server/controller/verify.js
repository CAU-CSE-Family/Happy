const User = require('../models/user')

exports.verifyUser = async function (req){
  const data = JSON.parse(req.data)
  console.log(data)

  var userData = []

  User.findOne({ id: data["id"], session: data["session"], id_family: data["id_family"] }).then(existingUser => {
    if (!existingUser) {
      userData.push(null, null)
      return userData
    }
    else {
      userData.push(String(data["id"]), String(data["id_family"]))
      return userData
    }
  })
}