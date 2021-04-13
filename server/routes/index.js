const express = require('express')
const router  = express.Router()
const controller = require('./routes/controller')

router.post('/requestSmsCode', controller.send)
router.post('/requestVerify', controller.verify)

module.exports = router