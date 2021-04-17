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

  User.findOneAndUpdate({ id: googleId, session: sessionKey }, {
      $set : { id_family: familyId }
    }).then(existingUser => {
    if (!existingUser) {
      console.log("No matching user ID and token in the DB.")
      res.json({result: false, message: "ID와 Token이 유효하지 않습니다."})
    }
    else if (existingUser) {
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
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: err})
  })
}

exports.joinFamily = async function (req, res){
  console.log("Join Family:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]
  const familyId = req.body["id_family"]

  User.findOne({ id: googleId, session: sessionKey }).then(existingUser => {
    if (!existingUser) {
      console.log("No matching user ID and token in the DB.")
      res.json({result: false, message: "ID와 Token이 유효하지 않습니다."})
    }
    else if (existingUser) {
      User.find({ id_family: familyId }).then(existingFamily => {
        if (!existingFamily) {
          console.log("No matching family ID in the DB.")
          res.json({result: false, message: "매칭되는 family ID가 없습니다."})
        }
        else if (existingFamily) {
          console.log(existingFamily)
          console.log(existingFamily[0])

          User.findByIdAndUpdate({ id: googleId }, {
            $set : { id_family: familyId }
          }, (err) => {
            console.log(err)
            res.json({result: false, message: "Error: Can't update user to DB"})
          })

          const members = []
          existingFamily.forEach(member => {
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
          res.json({result: true, message: "Successfully join family", family: familyId, members: members})
        }
      }).catch(err => {
        console.log(err)
        res.json({result: false, message: err})
      })
    }
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: err})
  })
}