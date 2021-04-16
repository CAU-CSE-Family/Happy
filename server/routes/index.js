const router = require('express').Router()
const controller = require('../controller/controller')

router.post('/requestSmsCode', controller.requestSmsCode)

router.post('/signUp', controller.signUp)

router.post('/signIn', controller.signIn)

router.post('/signInWithToken', controller.signInWithToken)

//router.post('/createFamily')

//router.post('/joinFamily')

// router.post('/upload', controller.uploadFile)

module.exports = router