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
  console.log(JSON.stringify(req))
  const phoneNumber = req[0].phone
  const authNumber = rand.authNo(6)

  if (cache.get(phoneNumber)) {
    cache.del(phoneNumber)
  }
  cache.put(phoneNumber, authNumber, vaildTime)

  const vaildTime = 180000; //3 minutes
  //timer.countdown("viewtimer", "timer", Number(vaildTime))

  try {
    axios.post(
      'https://api-sens.ncloud.com/v1/sms/services/${process.env.SENS_SERVICEID}/messages',
      {
        'X-NCP-auth-key': process.env.SENS_ACCESSKEYID,
        'X-NCP-service-secret': process.env.SENS_SERVICESECRET
      },
      {
        type: 'sms',
        from: process.env.SENS_SENDNUMBER,
        to: [phoneNumber],
        content: '[Happy] 인증번호 ${authNumber}를 입력해주세요. 인증번호의 유효시간은 3분입니다.'
      }
    )
    return res.json({"result": True})
  } catch (err) {
    cache.del(phoneNumber)
    throw err
  }
});

router.post('/requestVerify', (req, res, next) => {
  console.log(JSON.stringify(req))
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