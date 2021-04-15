const router = require('express').Router()
const controller = require('../middleware/controller')

router.post('/requestSmsCode', controller.requestSmsCode)

router.post('/signUp', controller.signUp)

router.post('/signIn', controller.signIn)

router.post('/signInWithToken', controller.signInWithToken)

module.exports = router