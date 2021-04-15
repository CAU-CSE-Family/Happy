//const timer   = require("../public/timer.js")
const { OAuth2Client } = require('google-auth-library')
const rand      = require("../public/rand.js")
const axios     = require('axios')
const cryptoJs  = require('crypto-js')
const User      = require('../models/user')
const cache     = require("memory-cache")

const date      = Date.now().toString()
const uri       = `${process.env.SENS_SERVICEID}`
const secretKey = `${process.env.SENS_SERVICESECRET}`
const accessKey = `${process.env.SENS_ACCESSKEYID}`
const url       = `https://sens.apigw.ntruss.com/sms/v2/services/${encodeURIComponent(uri)}/messages`

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)

function makeSignature(serviceId, timeStamp, accessKey, secretKey) {
  const method    = 'POST'
  const space     = ' '
  const newLine   = '\n'
  const url2      = `/sms/v2/services/${serviceId}/messages`
  
  const hmac = cryptoJs.algo.HMAC.create(cryptoJs.algo.SHA256, secretKey)
  hmac.update(method)
  hmac.update(space)
  hmac.update(url2)
  hmac.update(newLine)
  hmac.update(timeStamp)
  hmac.update(newLine)
  hmac.update(accessKey)

  const hash = hmac.finalize()
  return hash.toString(cryptoJs.enc.Base64)
}

function makeid(length) {
  var result           = [];
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
 }
 return result.join('')
}

exports.send = async function (req, res) {
  console.log(req.body)
  const phoneNumber = req.body.phone
  const authNumber = rand.authNo(6)
  const vaildTime = 180000 //3 Minutes

  if (cache.get(phoneNumber)) {
    cache.del(phoneNumber)
  }
  cache.put(phoneNumber, authNumber, vaildTime)

  // timer.countdown(Number(vaildTime))

  axios.post(url,
    JSON.stringify({
      type: "SMS",
      contentType: "COMM",
      countryCode: "82",
      from: `${process.env.SENS_SENDNUMBER}`,
      content: `[Happy] 인증번호 ${authNumber}를 입력해주세요.`,
      messages: [
        { to: `${phoneNumber}` }
      ]
    }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': date,
      'x-ncp-iam-access-key': accessKey,
      'x-ncp-apigw-signature-v2': makeSignature(encodeURIComponent(uri), date, accessKey, secretKey),
    }
  })
  .then((response) => {
    console.log('Response: ', response.data)
    res.json({result: true, messages: "인증번호 발송 완료"})
  })
  .catch((response) => {
    // console.log(response)
    console.log(response.status)
    if (response.data == undefined) {
      res.json({result: true, messages: "error: undefined"})
    }
    else {
      console.log('인증 문자 발송에 문제가 있습니다.')
      res.json({result: false, messages: "인증번호 발송 오류"})
    }
  })
}

exports.verify = async function (req, res) {
  console.log(req.body)
  const token = req.body.tokenData["token"]
  console.log(token)

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  const userid = payload['sub']
  console.log(userid)
  const sessionKey = makeid(32)
  
  const user = {
    id: "google" + userid,
    session: sessionKey,
    name: req.body.profileData["name"],
    phone: req.body.profileData["phone"],
    photo_url: req.body.profileData["photoUrl"],
    id_family: "null"
  }

  User.findOne({ id: "google" + userid }).then(existingUser => {
    if (!existingUser) {
        new User(user).save()
    }
  })

  const receiveAuthNumber = req.body.smsCode
  const receivephoneNumber = cache.keys()
  console.log(receivephoneNumber)

  if (!receivephoneNumber) {
    console.log('Time out')
    res.json({result: false, message: "인증 시간 초과"})
  }
  else if (!cache.get(receivephoneNumber)) {
    console.log('No auth Number')
    res.json({result: false, message: "인증번호가 입력되지 않았습니다."})
  }
  else if (cache.get(receivephoneNumber) == receiveAuthNumber) {
    console.log('Sucessfully verified')
    res.json({result: true, message: "회원가입이 완료되었습니다.", user: user})
  }
  else {
    console.log('Wrong request: Not verified')
    res.json({result: false, message: "잘못된 요청"})
  }
}