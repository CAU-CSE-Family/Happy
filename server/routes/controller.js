//const timer   = require("../public/timer.js")
const rand      = require("../public/rand.js")
const axios     = require('axios')
const cache     = require('memory-cache')
const cryptoJs  = require('crypto-js')

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

exports.send = async function (req, res) {
  console.log(req.body)
  const phoneNumber = req.body.phone
  const authNumber = rand.authNo(6)
  const vaildTime = 180000 //3 Minutes

  if (cache.get(phoneNumber)) {
    cache.del(phoneNumber)
  }
  cache.put(phoneNumber, authNumber, vaildTime)

  //timer.countdown(Number(vaildTime))

  axios.post(url,
    JSON.stringify({
      type: "SMS",
      contentType: "COMM",
      countryCode: "82",
      from: `${process.env.SENS_SENDNUMBER}`,
      content: `인증번호 ${authNumber}를 입력해주세요.`,
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
    res.json({result: true})
  })
  .catch((response) => {
    console.log(response)
    console.log(response.status)
    if (response.data == undefined) {
      res.json({result: true})
    }
    else {
      console.log('인증 문자 발송에 문제가 있습니다.')
      res.json({result: false})
    }
  })
}

exports.verify = async function (req, res) {
  const phoneNumber = req.body.phone
  const authNumber = req.body.auth

  if (!cache.get(phoneNumber)) {
    console.log('Time out')
    res.end('유효 시간 초과')
  }
  else if (!authNumber) {
    console.log('No auth Number')
    res.end('인증번호를 입력하지 않았습니다.')
  }
  else if (cache.get(phoneNumber) == authNumber) {
    console.log('Sucessfully verified')
    res.json({"result": True})
  }
  else {
    console.log('Wrong request: Not verified')
    res.end('잘못된 요청')
  }
}