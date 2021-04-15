const { OAuth2Client } = require('google-auth-library')
const User  = require('../models/user')
const cache = require('memory-cache')

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)

exports.verify = async function (req, res) {
  console.log(req.body)
  const { token } = req.body.tokenData["token"]
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  const userid = payload['sub']
  console.log(userid)

  const client = {
    googleId: userid,
    displayName: req.body.profileData["name"],
    phone: req.body.profileData["phone"],
    photo: req.body.profileData["photoUrl"]
  }

  User.findOne({ googleId: userid }).then(existingUser => {
    if (!existingUser) {
        new User(client).save()
    }
  })

  const receiveAuthNumber = req.body.smsCode
  

  if (!cache.get(phoneNumber)) {
    console.log('Time out')
    res.json({"result": False, "message": "인증 시간 초과"})
  }
  else if (!cache.get(authNumber)) {
    console.log('No auth Number')
    res.json({"result": False, "message": "인증번호가 입력되지 않았습니다."})
  }
  else if (cache.get(authNumber) == receiveAuthNumber) {
    console.log('Sucessfully verified')
    res.json({"result": True, "message": "회원가입이 완료되었습니다.", "user": client})
  }
  else {
    console.log('Wrong request: Not verified')
    res.json({"result": False, "message": "잘못된 요청"})
  }
}