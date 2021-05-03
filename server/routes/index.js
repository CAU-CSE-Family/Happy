const router = require('express').Router()
const multer = require('../config/multer')
const sign   = require('../controller/sign')
const family = require('../controller/family')
const member = require('../controller/member')
const upload = require('../controller/upload')

router.post('/requestSmsCode', sign.requestSmsCode)

router.post('/signUp', sign.signUp)

router.post('/signIn', sign.signIn)

router.post('/signInWithToken', sign.signInWithToken)

router.post('/createFamily', family.createFamily)

router.post('/joinFamily', family.joinFamily)

router.post('/leaveFamily', family.leaveFamily)

router.post('/getMembers', member.getMembers)

// router.post('/uploadImage', multer.upload.single('image'), upload.uploadImage)

// router.post('/getImages', upload.getImages)

module.exports = router