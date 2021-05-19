const rand     = require('../public/rand.js')
const User     = require('../models/user')
const Family   = require('../models/family')
const jwt      = require('jsonwebtoken')

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
  console.log("Create Family:\n", req.headers)

  const token = req.headers['authorization'].split(" ")[1]
  console.log(token)
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY)
    console.log("\npayload: ", payload)
    const googleId = payload['id']
    const familyId = createFamilyId()
    try {
      const clientFamily = {
        id: familyId,
        user_list: { id_user: googleId }
      }
      const newFamily = new Family(clientFamily).save()
      if (!newFamily) {
        res.status(401).json({ msg: "Error in DB on creating family" })
      }
      else {
        const user = await User.findOneAndUpdate(
          { id: googleId },
          { $set : { id_family: familyId } }
        )
        if (!user) {
          const deletedFamily = await Family.deleteOne({ id: clientFamily.id })
          console.log("User ID and session not vaild, delete family: ", deletedFamily)
          res.status(401).json({ msg: "User ID and session not vaild" })
        }
        else {
          res.status(200).json({ familyId: familyId })
        }
      }
    } catch (err) {
      res.status(401).json({ msg: err })
    }
  } catch (err) {
    res.status(401).json({ msg: err })
  }
}

exports.joinFamily = async function (req, res){
  console.log("Join Family:\n", req.body)

  const googleId = req.body.authData["id"]
  const sessionKey = req.body.authData["session"]
  const familyId = req.body["family"]
  var tempFamilyId = ""
  var result = true
  var msg = "Successfully join family"

  try {
    const user = await User.findOneAndUpdate(
      { id: googleId, session: sessionKey },
      { $set : { id_family: familyId } }
    )
    if (!user) {
      result = false
      msg = "User ID and session not vaild"
    }
    else {
      tempFamilyId = user["id_family"]
      try {
        const family = await Family.findOneAndUpdate(
          { id: familyId },
          { $push : { user_list: { id_user: googleId } } }
        )
        if (!family) {
          result = false
          msg = "Family ID is not in DB"
        }
      } catch (err) {
        console.log(err)
        result = false
        msg = "Error occured in DB"
      }
    }
  } catch (err) {
    console.log(err)
    result = false
    msg = "Error occured in DB"
  }

  if (result === false) {
    await User.findOneAndUpdate(
      { id: googleId, session: sessionKey },
      { $set : { id_family: tempFamilyId } }
    )
  }

  res.json({result: result, message: msg, family: familyId})
}

exports.leaveFamily = async function (req, res){
  console.log("Leave Family:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]
  var result = true
  var msg = "Successfully leave family"

  try {
    const user = await User.findOne({ id: googleId, session: sessionKey })
    if (!user) {
      result = false
      msg = "User ID and session not vaild"
    } else {
      try {
        const family = await Family.findOneAndUpdate(
          { id: user["id_family"] },
          { $pull: { user_list: { id_user: googleId } } },
          { upsert: false, multi: true }
        )
        console.log("Leave family ID: ", user["id_family"])
        if (!family) {
          result = false
          msg = "Family ID not vaild"
        } else {
          await User.findOneAndUpdate(
            { id: googleId, session: sessionKey },
            { $set : { id_family: null } }
          )
        }
      } catch (err) {
        console.log(err)
        result = false
        msg = "Error occured in DB"
      }
    }
  } catch (err) {
    console.log(err)
    result = false
    msg = "Error occured in DB"
  }
  
  res.json({result: result, message: msg})
}
