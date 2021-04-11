const controller = require('./controller.js')
const express    = require('express')
const router     = express.Router()
//const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get('/', (req, res) => {
  res.render('main')
})

router.post('/requestSmsCode', controller.requestSmsCode)

router.post('/requestVerify', controller.requestVerify)

module.exports = router;