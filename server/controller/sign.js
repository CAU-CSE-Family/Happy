const timer     = require('../public/timer.js')
const rand      = require('../public/rand.js')
const User      = require('../models/user')
const axios     = require('axios')
const cryptoJs  = require('crypto-js')
const cache     = require('memory-cache')
const jwt       = require('jsonwebtoken')

// Create google oauth client to verify token
const { OAuth2Client } = require('google-auth-library')
const family = require('../models/family.js')
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

exports.getSmsCode = async function (req, res) {
  console.log("requestSmsCode:\n", req.body)

  const phoneNumber = req.body.phone
  const authNumber = rand.randomNumber(6)
  const vaildTime = 300000 // 5 Minutes

  if (cache.get(phoneNumber)) {
    cache.del(phoneNumber)
  }
  cache.put(phoneNumber, authNumber, vaildTime)
  timer.countdown(Number(vaildTime))

  var msg = "Successfully send authentication message"

  try {
    const date = Date.now().toString()
    const uri = `${process.env.SENS_SERVICEID}`
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${encodeURIComponent(uri)}/messages`
    const secretKey = `${process.env.SENS_SERVICESECRET}`
    const accessKey = `${process.env.SENS_ACCESSKEYID}`

    const response = await axios.post(url,
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
    console.log('Response: ', response.data)
  } catch(err) {
    console.log(err)
    msg = "Error on server sending authentication message"
    res.status(405).send(msg)
  }

  res.status(200)
  res.send(msg)
}

exports.signUp = async function (req, res) {
  console.log("signUp:\n", req.body)

  const token = req.body.oAuthData["oAuthToken"]
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  const googleId = payload['sub']
  const type = req.body.oAuthData["type"]
  const sessionKey = rand.randomString(32)
  const authNumber = req.body.code
  const phoneNumber = cache.keys()[0]

  const clientUser = {
    id: type + googleId,
    session: sessionKey,
    name: req.body.oAuthData["name"],
    phone: phoneNumber || req.body["phone"],
    photo_url: req.body.oAuthData["photoUrl"],
    id_family: null
  }

  var result = false
  var msg = ""
  try {
    var is_duplicated = false
    const user = await User.findOne({ id: type + googleId })
    if (user) { is_duplicated = true }
  } catch (err) {
    console.log(err)
    msg = "Error occured in DB"
  } finally {
    if (!phoneNumber) {
      msg = "Cache data deleted: authentication timed out"
    }
    else if (!cache.get(phoneNumber)) {
      msg = "Authentication number is not entered"
    }
    else if (is_duplicated) {
      msg = "This user ID is already in DB"
    }
    else if (cache.get(phoneNumber) == authNumber) {
      result = true
      msg = "Sucessfully verified"
    }
    else {
      msg = "Wrong request: Not verified access"
    }
  }

  if (result) {
    new User(clientUser).save()
    const userToken = jwt.sign({ id: clientUser.id }, process.env.SECRET_KET)
    const userDataResponse = {
      token: userToken,
      userId: clientUser.id,
      familyId: clientUser.id_family
    }
    res.status(200)
    res.json(userDataResponse)
  }
  else {
    res.status(400).send(msg)
  }
}

exports.signIn = async function (req, res){
  console.log("signIn:\n", req.body)

  const googleId = req.body["id"]
  User.findOne({ id: googleId }).then(existingUser => {
    if (!existingUser) {
      console.log("User\'s ID is not in DB")
      res.status(401).send("User\'s ID is not in DB")
    }
    else if (existingUser) {
      console.log("User data sent(SignIn):\n", existingUser)
      res.json({result: true, message: "Successfully sign in", user: existingUser})
    }
  })
}

exports.signInWithToken = async function (req, res){
  console.log("signInWithToken:\n", req.body)

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
      res.json({result: false, message: "ID token is not vaild."})
    }
    else if (existingUser) {
      res.json({result: true, message: "Successfully sign in with token", user: existingUser})
    }
  })
}

