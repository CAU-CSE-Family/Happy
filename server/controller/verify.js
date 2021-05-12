const User = require('../models/user')

exports.verifyUser = async function (req){
  console.log(req)
  const userData = []
  try {
    const user = await User.findOne({ id: req["id"], session: req["session"]})
    if (!user) {
      userData.push(null, null)
    }
    else {
      userData.push(req["id"], user["id_family"])
    }
  } catch (err) {
    console.log(err)
    userData.push(null, null)
  }
  return Promise.resolve(userData)
}
