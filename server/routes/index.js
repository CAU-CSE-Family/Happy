const router   = require('express').Router()
const sign     = require('../controller/sign')
const family   = require('../controller/family')
const member   = require('../controller/member')
const image    = require('../controller/image')
const wish     = require('../controller/wish')
const store    = require('../middlewares/multer')
const jwtauth  = require('../middlewares/jwtauth').checkToken

router.post('/getSmsCode', sign.getSmsCode)

router.post('/signUp', sign.signUp)

router.post('/signIn', sign.signIn)

router.get('/family', jwtauth, family.createFamily)

router.post('/joinFamily', jwtauth, family.joinFamily)

router.get('/leaveFamily', jwtauth, family.leaveFamily)

router.post('/uploadImages', store.any(), jwtauth, image.uploadImages)

router.get('/getImages', jwtauth, image.getImages)

router.post('/deleteImages', jwtauth, image.deleteImages)

//router.post('/uploadWishes', store.any(), wish.uploadWishes)

//router.post('/getWishes', wish.getWishes)

//router.post('/deleteWishes', wish.deleteWishes)

router.post('/getMembers', jwtauth, member.getMembers)

router.get('/reset', member.resetAllMembers)

module.exports = router