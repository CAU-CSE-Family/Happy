const member   = require('./member')
const rand     = require('../modules/rand.js')
const User     = require('../models/user')
const Family   = require('../models/family')

function createFamilyId(){
  var familyId = ""
  do {
    familyId = rand.randomString(16)
    if (Family.find({ id: familyId }).count() > 0) { familyId = "" }
    else { break }
  } while (true)
  console.log("Successfully created family ID: ", familyId)
  return familyId
}

exports.createFamily = async function (req, res){
  console.log("Create Family:" + req.id)
  try {
    const googleId = req.id
    const familyId = createFamilyId()
    const clientFamily = {
      id: familyId,
      user_list: { id_user: googleId }
    }

    const response = await new Family(clientFamily).save()
    console.log(response)
    if (response.ok != 1) {
      res.status(401).json({ msg: "Error in DB on creating family" })
    } 
    
    const response2 = await User.findOneAndUpdate(
      { id: googleId },
      { $set : { id_family: familyId } }
    )
    if (!response2) {
      const response3 = await Family.deleteOne({ id: clientFamily.id })
      console.log("User ID and session not vaild, delete family: ", response3)
      res.status(401).json({ msg: "User ID and session not vaild" })
    } 
    res.status(200).json({ familyId: familyId })
  } catch (err) {
    console.log(err)
    res.status(401).json({ msg: err })
  }
}

exports.joinFamily = async function (req, res){
  console.log("Join Family:" + req.id)
  try {
    const googleId = req.id
    const user = await member.getMember(googleId)
    if (!user) {
      res.status(400).json({ message: "Invalid user ID" })
    }
    const sessionKey = user.session
    const familyId = user.id_family
    const reqFamilyId = req.id_family

    const response = await User.findOneAndUpdate(
      { id: googleId, session: sessionKey },
      { $set : { id_family: reqFamilyId } }
    )
    if (response.ok != 1) {
      res.status(400).json({ message: "Invalid user ID" })
    }
    const response2 = await Family.findOneAndUpdate(
      { id: familyId },
      { $push : { user_list: { id_user: googleId } } }
    )
    if (response2.ok != 1) {
      await User.findOneAndUpdate(
        { id: googleId, session: sessionKey },
        { $set : { id_family: familyId } }
      )
      res.status(400).json({ message: "Invalid family ID" })
    }
    res.status(200).json({ family: familyId })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured in DB" })
  }
}

exports.leaveFamily = async function (req, res){
  console.log("Leave Family:" + req.id)
  try {
    const googleId = req.id
    const user = await member.getMember(googleId)
    if (!user) {
      res.status(400).json({ message: "Invalid user ID" })
    }
    const sessionKey = user.session

    const response = await User.findOne({ id: googleId, session: sessionKey })
    if (response.ok != 1) {
      res.status(400).json({ message: "Invalid user ID" })
    } 
    
    const response2 = await Family.findOneAndUpdate(
      { id: user.id_family },
      { $pull: { user_list: { id_user: googleId } } },
      { upsert: false, multi: true }
    )
    console.log("Leave family ID: " + user.id_family)
    if (response2.ok != 1) {
      res.status(400).json({ message: "Invalid family ID" })
    }

    const response3 = await User.findOneAndUpdate(
      { id: googleId, session: sessionKey },
      { $set : { id_family: null } }
    )
    if (response3.ok != 1) {
      res.status(400).json({ message: "Invalid user ID" })
    }
    res.status(200).json({ message: "Successfully leave family" })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured in DB" })
  }
}
