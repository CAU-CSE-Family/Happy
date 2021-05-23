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
  console.log("Create Family: " + req.id)
  try {
    const googleId = req.id
    const familyId = createFamilyId()
    const clientFamily = {
      id: familyId,
      user_list: { id_user: googleId }
    }

    const response = await new Family(clientFamily).save()
    if (!response.id)
      return res.status(401).json({ msg: "Error occured in DB" })
    
    const response2 = await User.findOneAndUpdate(
      { id: googleId },
      { $set : { id_family: familyId } }
    )
    if (!response2.id) {
      const response3 = await Family.deleteOne({ id: clientFamily.id })
      console.log("Invalid user ID, delete family: ", response3)
      return res.status(401).json({ msg: "Invalid user ID" })
    } 
    res.status(200).json({ familyId: familyId })
  } catch (err) {
    console.log(err)
    res.status(401).json({ msg: err })
  }
}

exports.joinFamily = async function (req, res){
  console.log("Join Family: " + req.id)
  try {
    const googleId = req.id
    const user = await member.getMember(googleId)
    if (!user)
      return res.status(400).json({ message: "Invalid user ID" })
    const familyId = user.id_family
    const reqFamilyId = req.body.familyId

    const response = await User.findOneAndUpdate(
      { id: googleId },
      { $set : { id_family: reqFamilyId } }
    )
    if (!response.id)
      return res.status(400).json({ message: "Invalid user ID" })

    const response2 = await Family.findOneAndUpdate(
      { id: reqFamilyId },
      { $push : { user_list: { id_user: googleId } } }
    )
    if (!response2.id) {
      await User.findOneAndUpdate(
        { id: googleId },
        { $set : { id_family: familyId } }
      )
      return res.status(400).json({ message: "Invalid family ID" })
    }

    res.status(200).json({ familyId: reqFamilyId })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured in DB" })
  }
}

exports.leaveFamily = async function (req, res){
  console.log("Leave Family: " + req.id)
  try {
    const googleId = req.id
    const user = await member.getMember(googleId)
    if (!user)
      return res.status(400).json({ message: "Invalid user ID" })
    
    const response = await Family.findOneAndUpdate(
      { id: user.id_family },
      { $pull: { user_list: { id_user: googleId } } },
      { upsert: false, multi: true }
    )
    if (!response.id)
      return res.status(400).json({ message: "Invalid family ID" })

    const response2 = await User.findOneAndUpdate(
      { id: googleId },
      { $set : { id_family: null } }
    )
    if (!response2.id)
      return res.status(400).json({ message: "Invalid user ID" })

    res.status(200).json({ message: "Successfully leave family" })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured in DB" })
  }
}
