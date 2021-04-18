const rand     = require("../public/rand.js")
const User     = require('../models/user')

exports.createFamily = async function (req, res){
  console.log("Create Family:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]
  
  let familyId = ""
  do {
    familyId = rand.randomString(16)
    if (User.find({ id_family: familyId }).count() > 0) {
      familyId = ""
    } else { break }
  } while (true)
  console.log("Successfully created family ID: ", familyId)
  
  User.findOneAndUpdate({ id: googleId, session: sessionKey },
    { $set : { id_family: familyId } }
  ).then(existingUser => {
    if (!existingUser) {
      console.log("No matching user ID and token in the DB.")
      res.json({result: false, message: "ID와 Token이 유효하지 않습니다."})
    }
    else if (existingUser) {
      res.json({result: true, message: "Successfully create family", family: familyId})
    }
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: err})
  })
}

exports.joinFamily = async function (req, res){
  console.log("Join Family:\n", req.body)

  const googleId = req.body.authData["id"]
  const sessionKey = req.body.authData["session"]
  const familyId = req.body["family"]

  if (User.find({ id_family: familyId }).count() == 0) {
    res.json({result: false, message: "id_family is not vaild."})
  } else {
    User.findOneAndUpdate({ id: googleId, session: sessionKey },
      { $set : { id_family: familyId } }
    ).then(existingUser => {
      if (!existingUser) {
        console.log("No matching user ID and token in the DB.")
        res.json({result: false, message: "ID와 Token이 유효하지 않습니다."})
      }
      else if (existingUser) {
        res.json({result: true, message: "Successfully join family", family: familyId})
      }
    }).catch(err => {
      console.log(err)
      res.json({result: false, message: err})
    })
  }
}

exports.leaveFamily = async function (req, res){
  console.log("Leave Family:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]

  User.findOneAndUpdate({ id: googleId, session: sessionKey },
    { $set : { id_family: null } }
  ).then(existingUser => {
    if (!existingUser) {
      console.log("No matching user ID and token in the DB.")
      res.json({result: false, message: "ID와 Token이 유효하지 않습니다."})
    }
    else if (existingUser) {
      res.json({result: true, message: "Successfully leave family"})
    }
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: err})
  })
}