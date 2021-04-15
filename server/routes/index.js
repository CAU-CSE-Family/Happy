const router = require('express').Router()
const controller = require('../middleware/controller')

router.post('/requestSmsCode', controller.send)

router.post('/signUp', controller.verify)

module.exports = router