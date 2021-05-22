const User = require('../models/user')

exports.getMember = async function (userId) {
  try {
    const user = await User.findOne({ id: userId })
    if (!user) {
      return null
    }
    else {
      return user
    }
  } catch (err) {
    console.log(err)
    return null
  }
}

exports.getMembers = async function (req, res){
  console.log("getMembers: " + req.id)

  try {
    const googleId = req.id
    const user = await module.exports.getMember(googleId)
    if (!user) {
      res.status(400).json({ message: "Invalid user ID" })
    }
    const familyId = user.id_family
    const members = []

    const users = await User.find({ id_family: familyId })
    users.forEach(member => {
      const MemberData = {
        "id": member.id,
        "profileData": ProfileData = {
          "name": member.name,
          "phone": member.phone,
          "photoUrl": member.photo_url
        }
      }
      members.push(MemberData)
    })
    res.status(200).json({ family: familyId, members: members })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured in DB" })
  }
}

exports.resetAllMembers = async function (req, res){
  console.log("Reset all users data")

  try {
    const response = await User.deleteMany({})
    if (response.ok != 1) {
      res.status(400).json({ message: "Error occured in DB" })
    } else {
      res.status(200).json({ message: "Successfully delete all users data" })
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured in DB" })
  }
}