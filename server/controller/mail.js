const member   = require('./member')
const Mail     = require('../models/mail')
const mongoose = require('mongoose')

exports.writeMail = async function (req, res){
  console.log("getImages: " + req.id)

  try {
    const user = await member.getMember(req.id)
    if (!user)
      return res.status(400).json({ message: "Invalid user ID" })

    const newMail = {
      id: new mongoose.Types.ObjectId(),
      to_user_id: req.body.toUserId,
      from_user_id: req.id,
      content: req.body.content,
    }

    const response = new Mail(newMail).save()
    if (!response.id)
      return res.status(400).json({ message: "Error occured in DB" })
    else
      return res.status(200).json()
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err })
  }
}