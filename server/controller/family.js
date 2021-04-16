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
      familyId = ""
      do {
        familyId = rand.randomString(16)
        User.findOne({ id_family: familyId }).then(() => {
          familyId = null
        })
      } while (familyId)
      console.log("Successfully created family ID: ", familyId)
    
      User.findByIdAndUpdate({ id: googleId }, {
        $set : { id_family: familyId }
      }, (err) => {
        console.log(err)
        res.json({result: false, message: "Error: Can't update user DB"})
      })

      const MemberData = {
        "id": existingUser.id,
        "profileData": ProfileData = {
          "name": existingUser.name,
          "phone": existingUser.phone,
          "photoUrl": existingUser.photo_url
        }
      }
      res.json({result: true, message: "Successfully create family", family: familyId, members: [MemberData]})
    }
  })
}