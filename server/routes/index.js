const rand       = require("../public/rand.js")
const timer      = require("../public/main.js")
const axios      = require('axios')
const express    = require('express')
const cache      = require('memory-cache')
const router     = express.Router()
//const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get('/', (req, res) => {
  res.render('main')
})

router.post('/requestSmsCode', (req, res, next) => {
  const phoneNumber = req.body.phone
  const authNumber = rand.authNo(6)
  const vaildTime = 180000 //3 Minutes

  if (cache.get(phoneNumber)) {
    cache.del(phoneNumber)
  }
  cache.put(phoneNumber, authNumber, vaildTime)

  //timer.countdown(Number(vaildTime))

  axios({
    method: 'POST',
    json: true,
    url = 'https://api-sens.ncloud.com/v1/sms/services/${process.env.SENS_SERVICEID}/messages',
    headers: {
      'Content-Type': 'application.json',
      'x-ncp-iam-access-key': process.env.SENS_ACCESSKEYID,
      'x-ncp-apigw-timestamp': Date.now().toString(),
      'x-ncp-apigw-signature-v2': process.env.SENS_SERVICESECRET,
    },
    data: {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: process.env.SENS_SENDNUMBER,
      content: '[Happy] 인증번호 ${authNumber}를 입력해주세요. 인증번호의 유효시간은 3분입니다.',
      messages: [
        { to: '${phoneNumber}', },
      ],
    },
  })
  .then(function (res) {
    console.log('Response: ', res.data, res['data'])
    res.json({result: true})
  })
  .catch((err) => {
    console.log(err.res)
    if (err.res == undefined) {
      res.json({result: true})
    }
    else res.json({result: false})
  })
});

router.post('/requestVerify', (req, res, next) => {
  const phoneNumber = req.body.phone
  const authNumber = req.body.auth

  if (!cache.get(phoneNumber)) {
    console.log('Time out')
    res.end('유효 시간 초과')
  }
  else if (!authNumber) {
    res.end('인증번호를 입력하지 않았습니다.')
  }
  else if (cache.get(phoneNumber) == authNumber) {
    console.log('Sucess verified')
    res.json({"result": True})
  }
  else {
    console.log('not verified')
    res.end('잘못된 요청')
  }
})

module.exports = router;