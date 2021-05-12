const User = require('../models/user')

exports.verifyUser = async function (data){
  console.log(data)
  const userData = []
  try {
    const user = await User.findOne({ id: data["id"], session: data["session"]})
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