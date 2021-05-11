const User = require('../models/user')

exports.verifyUser = async function (req){
  const data = req.data
  const userData = []

  console.log(data)
  try {
    const user = await User.findOne({ id: data["id"], session: data["session"], id_family: data["id_family"] })
    if (!user) {
      userData.push(null, null)
    }
    else {
      userData.push(data["id"], data["id_family"])
    }
  } catch (err) {
    console.log(err)
    userData.push(null, null)
  }
  return Promise.resolve(userData)
}