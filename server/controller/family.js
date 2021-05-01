const rand     = require("../public/rand.js")
const User     = require('../models/user')
const Family   = require('../models/family')

const createFamilyId = async function (){
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
  console.log("Create Family:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]
  const familyId = createFamilyId()
  const clientFamily = {
    id: familyId,
    user_list: [{ id_user: googleId }]
  }
  
  User.findOneAndUpdate(
    { id: googleId, session: sessionKey },
    { $set : { id_family: familyId } }
  ).then(existingUser => {
    if (existingUser) { new Family(clientFamily).save() }
    else { res.json({result: false, message: "User ID and session not vaild"}) }
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: "Error occured in DB"})
  })

  res.json({result: true, message: "Successfully create family", family: familyId})
}

exports.joinFamily = async function (req, res){
  console.log("Join Family:\n", req.body)

  const googleId = req.body.authData["id"]
  const sessionKey = req.body.authData["session"]
  const familyId = req.body["family"]

  Family.findOne({ id: familyId }).then(existingFamily => {
    if (!existingFamily) { res.json({result: false, message: "No family ID in DB"}) }
    else {
      User.findOneAndUpdate(
        { id: googleId, session: sessionKey },
        { $set : { id_family: familyId } }
      ).then(existingUser => {
        if (!existingUser) { res.json({result: false, message: "User ID and session not vaild"}) }
      })
      Family.findOneAndUpdate(
        { id: familyId },
        { $push : { user_list: { id_user: googleId } } }
      ).then(existingFamily => {
        if (!existingFamily) { res.json({result: false, message: "User ID and session not vaild"}) }
      })
    }
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: "Error occured in DB"})
  })

  res.json({result: true, message: "Successfully join family", family: familyId})
}

exports.leaveFamily = async function (req, res){
  console.log("Leave Family:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]

  User.findOne({ id: googleId, session: sessionKey }).then(existingUser => {
    if (!existingUser) { res.json({result: false, message: "User ID and session not vaild"}) }
    else {
      const familyId = existingUser["id_family"]
      Family.collection.countDocuments({ id: familyId }).then(existingFamily => {
        if (!existingFamily) { res.json({result: false, message: "No family ID in DB"}) }
        else {
          Family.findOneAndUpdate({ id: familyId }, 
            { $pull : { user_list: { id_user: googleId } } })
          User.findOneAndUpdate({ id: googleId, session: sessionKey },
            { $set : { id_family: null } })
        }
      })
    }
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: "Error occured in DB"})
  })

  res.json({result: true, message: "Successfully leave family"})
}