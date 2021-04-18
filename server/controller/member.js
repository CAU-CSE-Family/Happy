const User     = require('../models/user')

exports.getMembers = async function (req, res){
  console.log("getMembers:\n", req.body)

  const googleId = req.body["id"]
  const sessionKey = req.body["session"]

  User.findOne({ id: googleId, session: sessionKey }).then(existingUser => {
    if (!existingUser) {
      res.json({result: false, message: "No matching user ID and session in the DB."})
    }
    else {
      const members = []
      User.find({ id_family: existingUser["id_family"] }).then(existingFamily => {
        console.log(existingFamily)
        if (!existingFamily) {
          console.log("No matching family ID in the DB.")
          res.json({result: false, message: "매칭되는 family ID가 없습니다."})
        }
        else if (existingFamily) {
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
          res.json({result: true, message: "Members of family", family: existingUser["id_family"], members: members})
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

