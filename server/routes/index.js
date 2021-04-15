const router = require('express').Router()
const controller = require('../middleware/controller')
const auth = require('../middleware/auth')

router.post('/requestSmsCode', controller.send)

router.post('/requestVerify', controller.verify)

router.post('/signUp', (req, res) => {
    const { idToken } = req.body
    auth.verify(idToken).catch(console.error)
})

module.exports = router