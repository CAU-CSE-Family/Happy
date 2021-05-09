const router = require('express').Router()
const sign   = require('../controller/sign')
const family = require('../controller/family')
const member = require('../controller/member')
const images = require('../controller/images')
const store  = require('../config/multer')

router.post('/requestSmsCode', sign.requestSmsCode)

router.post('/signUp', sign.signUp)

router.post('/signIn', sign.signIn)

router.post('/signInWithToken', sign.signInWithToken)

router.post('/createFamily', family.createFamily)

router.post('/joinFamily', family.joinFamily)

router.post('/leaveFamily', family.leaveFamily)

router.post('/getMembers', member.getMembers)

router.post('/uploadImages', store.array('images', 24), images.uploadImages)

router.post('/getImages', images.getImages)

module.exports = router