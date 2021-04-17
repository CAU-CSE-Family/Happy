const User     = require('../models/user')

const members = []

exports.getMembers = async function (req, res){
  console.log("getMembers:\n", req.body)

  const googleId = req.body.authData["id"]
  const sessionKey = req.body.authData["session"]
  const familyId = req.body["family"]
  
  if (User.find({ id: googleId, session: sessionKey }).count() == 0) {
    res.json({result: false, message: "No matching user ID and session in the DB."})
  }

  User.find({ id_family: familyId }).then(existingFamily => {
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
      res.json({result: true, message: "Members of family", family: familyId, members: members})
    }
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: err})
  })
}

