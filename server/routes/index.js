const rand       = require("../rand.js")
const axios      = require('axios');
const express    = require('express')
const formidable = require('formidable')
const cache      = require('memory-cache')
const router     = express.Router()
//const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get('/', (req, res) => {
  res.render('main')
})

router.post('/', (req, res, next) => {
  const phoneNumber = req.body.phoneNumber
  const vaildTime = 1800000; //30 minutes
  const authNumber = rand.authNo(6)
  
  if (cache.get(phoneNumber)) {
    cache.del(phoneNumber)
  }
  cache.put(phoneNumber, authNumber, vaildTime)
  res.send(vaildTime.toString())

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
        to: ['${phoneNumber}'],
        content: '[Happy] 인증번호 [${authNumber}]를 입력해주세요.'
      }
    )
    return res.end('인증번호 요청 성공')
  } catch (err) {
    cache.del(phoneNumber)
    throw err
  }
});

router.post('/verify', (req, res, next) => {
  var form = new formidable.IncomingForm()
  form.parse(req, (err, body) => {
    const phoneNumber = body.phoneNumber
    const authNumber = body.authNumber

    if (!cache.get(phoneNumber)) {
      console.log("Time out")
      res.end("<h1>유효 시간 초과</h1>")
    }
    else if (cache.get(phoneNumber) == authNumber) {
      console.log('Sucess verified')
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end("인증완료")
    }
    else {
      console.log("not verified")
      res.end("<h1>잘못된 요청</h1>")
    }
  })
})

module.exports = router;