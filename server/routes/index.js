const router = require('express').Router()
const sign   = require('../controller/sign')
const family = require('../controller/family')

router.post('/requestSmsCode', sign.requestSmsCode)

router.post('/signUp', sign.signUp)

router.post('/signIn', sign.signIn)

router.post('/signInWithToken', sign.signInWithToken)

router.post('/createFamily', family.createFamily)

router.post('/joinFamily', family.joinFamily)

// router.post('/upload', controller.uploadFile)

module.exports = router