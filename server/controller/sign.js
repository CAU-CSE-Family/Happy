const timer     = require('../modules/timer')
const rand      = require('../modules/rand')
const jwt       = require('../modules/jwt')
const User      = require('../models/user')
const axios     = require('axios')
const cryptoJs  = require('crypto-js')
const cache     = require('memory-cache')

// Create google oauth client to verify token
const { OAuth2Client } = require('google-auth-library')
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
    res.status(405).json({ message: "Error on server sending authentication message"})
  }
  res.status(200).json()
}

exports.signUp = async function (req, res) {
  console.log("signUp:\n", req.body)

  const token = req.body.oAuthData["oAuthToken"]
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()

  const type = req.body.oAuthData["type"]
  const googleId = payload["sub"]
  const sessionKey = rand.randomString(32)
  const phoneNumber = cache.keys()[0]
  const authNumber = req.body.code

  const clientUser = {
    id: type + googleId,
    session: sessionKey,
    name: req.body.oAuthData["name"],
    phone: phoneNumber,
    photo_url: req.body.oAuthData["photoUrl"],
    id_family: null
  }

  let result = false
  if (!phoneNumber) {
    res.status(400).json({ message: "Authentication timed out" })
  }
  else if (!cache.get(phoneNumber)) {
    res.status(400).json({ message: "Authentication number is not entered" })
  }
  else if (cache.get(phoneNumber) == authNumber) {
    result = true
  }
  else {
    res.status(400).json({ message: "Wrong request: Not verified access" })
  }

  if (result) {
    try {
      const jwtToken = await jwt.sign(clientUser)
      const userData = {
        token: jwtToken.token,
        userId: clientUser.id,
        familyId: clientUser.id_family
      }
      new User(clientUser).save()
      res.status(200).json(userData)
    } catch (err) {
      res.status(400).json({ message: err })
    }
  }
  else {
    res.status(400).json({ message: "Sucessfully verified" })
  }
}

exports.signIn = async function (req, res){
  console.log("signIn:\n", req.body)

  const token = req.body["oAuthToken"]
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()

  const type = req.body["type"]
  const googleId = payload["sub"]
  
  const clientUser = {
    id: type + googleId,
  }

  try {
    const user = await User.findOne({ id: clientUser.id })
    console.log(user)
    if (!user) {
      res.status(401).json("User\'s ID is not in DB")
    } else {
      const jwtToken = await jwt.sign(clientUser)
      const userData = {
        token: jwtToken.token,
        userId: clientUser.id,
        familyId: clientUser.id_family
      }
      res.status(200).json(userData)
    }
  } catch (err) {
    res.status(401).json({ message: err })
  }
}

