const router = require('express').Router()
const controller = require('../middleware/controller')
const auth = require('../middleware/auth')

router.post('/requestSmsCode', controller.send)

router.post('/requestVerify', controller.verify)

router.post('/signUp', auth.verify)

module.exports = router