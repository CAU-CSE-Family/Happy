const timer     = require("../public/timer.js")
const rand      = require("../public/rand.js")
const User      = require('../models/user')
const axios     = require('axios')
const cryptoJs  = require('crypto-js')
const cache     = require("memory-cache")

// Create google oauth client to verify token
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)

const date      = Date.now().toString()
const uri       = `${process.env.SENS_SERVICEID}`
const secretKey = `${process.env.SENS_SERVICESECRET}`
const accessKey = `${process.env.SENS_ACCESSKEYID}`
const url       = `https://sens.apigw.ntruss.com/sms/v2/services/${encodeURIComponent(uri)}/messages`

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

function makeSessionKey(length) {
  var result           = [];
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
 }
 return result.join('')
}

exports.requestSmsCode = async function (req, res) {
  console.log(req.body)
  const phoneNumber = req.body.phone
  const authNumber = rand.authNo(6)
  const vaildTime = 180000 //3 Minutes

  if (cache.get(phoneNumber)) {
    cache.del(phoneNumber)
  }
  cache.put(phoneNumber, authNumber, vaildTime)

  timer.countdown(Number(vaildTime))

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
    console.log(response.status)
    if (response.data == undefined) {
      res.json({result: false, messages: "error: undefined"})
    }
    else {
      console.log('인증 문자 발송에 문제가 있습니다.')
      res.json({result: false, messages: "인증번호 발송 오류"})
    }
  })
}

exports.signUp = async function (req, res) {
  console.log(req.body)
  const token = req.body.tokenData["token"]

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  const googleId = payload['sub']
  const type = req.body.tokenData["type"]
  const sessionKey = makeSessionKey(32)
  
  const clientUser = {
    id: type + googleId,
    session: sessionKey,
    name: req.body.profileData["name"],
    phone: req.body.profileData["phone"],
    photo_url: req.body.profileData["photoUrl"],
    id_family: "null"
  }

  User.findOne({ id: type + googleId }).then(existingUser => {
    if (!existingUser) {
        new User(clientUser).save()
    }
    else {
      res.end("이미 존재하는 유저입니다.")
    }
  })

  const authNumber = req.body.smsCode
  const phoneNumber = cache.keys()[0]
  console.log(phoneNumber)

  if (!phoneNumber) {
    console.log('Time out')
    res.json({result: false, message: "캐시 데이터 삭제됨: 인증 시간 초과"})
  }
  else if (!cache.get(phoneNumber)) {
    console.log('No auth Number')
    res.json({result: false, message: "인증번호가 입력되지 않았습니다."})
  }
  else if (cache.get(phoneNumber) == authNumber) {
    console.log('Sucessfully verified')
    cache.del(phoneNumber)
    res.json({result: true, message: "회원가입이 완료되었습니다.", user: clientUser})
  }
  else {
    console.log('Wrong request: Not verified')
    res.json({result: false, message: "잘못된 요청"})
  }
}

exports.signIn = async function (req, res){
  console.log(req.body)
  googleId = req.body["id"]
  User.findOne({ id: googleId }).then(existingUser => {
    if (!existingUser) {
      console.log("User\'s id is not in DB")
      res.json({result: false, message: "회원가입을 진행해 주세요."})
    }
    else if (existingUser) {
      console.log("User data sent: ", existingUser)
      res.json({result: true, message: "Successfully sign in", user: existingUser})
    }
  })
}

exports.signInWithToken = async function (req, res){
  console.log(req.body)
  const token = req.body["token"]

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  const googleId = payload['sub']
  const type = req.body["type"]

  User.findOne({ id: type + googleId }).then(existingUser => {
    if (!existingUser) {
      console.log("User\'s token is not vaild")
      res.json({result: false, message: "ID token이 유효하지 않습니다."})
    }
    else if (existingUser) {
      console.log("User data sent: ", existingUser)
      res.json({result: true, message: "Successfully sign in with token", user: existingUser})
    }
  })
}

