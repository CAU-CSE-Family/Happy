const rand = require("../public/rand.js")
const User = require('../models/user')

exports.createFamily = async function (req, res){
    console.log("Create Family:\n", req.body)

    googleId = req.body["id"]
    sessionKey = req.body["seesion"]

    User.findOne({ id: googleId, seesion: sessionKey }).then(existingUser => {
      if (!existingUser) {
        console.log("No matching user ID and token in the DB.")
        res.json({result: false, message: "ID와 Token이 유효하지 않습니다."})
      }
      else if (existingUser) {
        familyId = rand.randomString(16)
        User.findOne({ id_family: familyId }).then(existingFamilyId => {
            console.log("이미 존재하는 familyid입니다.")
            familyId = rand.randomString(16)
        })
        console.log("Create Sent: ", existingUser)
        res.json({result: true, message: "Successfully sign in", user: existingUser})
      }
    })
  }