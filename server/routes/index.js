const router   = require('express').Router()
const sign     = require('../controller/sign')
const family   = require('../controller/family')
const member   = require('../controller/member')
const photo    = require('../controller/photo')
const wish     = require('../controller/wish')
const store    = require('../middlewares/multer')
const jwtauth  = require('../middlewares/jwtauth').checkToken

router.post('/getSmsCode', sign.getSmsCode)

router.post('/signUp', sign.signUp)

router.post('/signIn', sign.signIn)

router.get('/family', jwtauth, family.createFamily)

router.post('/family', jwtauth, family.joinFamily)

router.delete('/family', jwtauth, family.leaveFamily)

router.post('/upload/photo', store.any(), jwtauth, photo.uploadPhotos)

//router.get('/getImages', jwtauth, image.getImages)

router.delete('/delete/photo', jwtauth, photo.deletePhotos)

router.post('/upload/wish', store.any(), wish.uploadWishes)

//router.post('/getWishes', wish.getWishes)

//router.post('/delete/wish', wish.deleteWishes)

router.get('/sync/user', jwtauth, member.getMembers)

router.get('/reset', member.resetAllMembers)

module.exports = router