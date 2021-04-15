const { OAuth2Client } = require('google-auth-library')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
)

exports.verify = async function (req, res) {
  console.log(req.body)
  const { token } = req.body
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  const userid = payload['sub']
  console.log(userid)

  User.findOne({ googleId: userid }).then(existingUser => {
    if (!existingUser) {
        new User({ googleId: userid }).save()
    }
    res.send(token)
  })
}