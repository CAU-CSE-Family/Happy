const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')


// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.send('login')
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const stories = await Message.find({ user: req.user.id }).lean()
    res.send('dashboard')
  } catch (err) {
    console.error(err)
    res.send('error/500')
  }
})

module.exports = router