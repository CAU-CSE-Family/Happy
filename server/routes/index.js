const router = require('express').Router()
const sign   = require('../controller/sign')

router.post('/requestSmsCode', sign.requestSmsCode)

router.post('/signUp', sign.signUp)

router.post('/signIn', sign.signIn)

router.post('/signInWithToken', sign.signInWithToken)

//router.post('/createFamily')

//router.post('/joinFamily')

// router.post('/upload', controller.uploadFile)

module.exports = router