const members = []

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
  }
}).catch(err => {
  console.log(err)
  res.json({result: false, message: err})
})