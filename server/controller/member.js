const User = require('../models/user')

exports.getMembers = async function (req, res){
  console.log("getMembers:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]
  const members = []
  var familyId = ""
  var result = false
  var msg = ""

  try {
    const user = await User.findOne({ id: googleId, session: sessionKey })
    if (!user) {
      msg =  "No matching user ID and session in the DB"
    }
    else {
      if (user["id_family"] == null) {
        msg = "No members matched"
        throw "NoMembersMatched"
      }
      else {
        familyId = user["id_family"]
        
        const userDocuments = await User.find({ id_family: user["id_family"] })
        userDocuments.forEach(member => {
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
        result = true
        msg = "Members of family"
      }
    }
  } catch (err) {
    console.log(err)
    if (err != "NoMembersMatched") {
      msg = "Error occured in DB"
    }
  }
  
  if (result) {
    res.json({result: result, message: msg, family: familyId, members: members})
  }
  else {
    res.json({result: result, message: msg})
  }
}

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