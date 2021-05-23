const member   = require('./member')
const Wish     = require('../models/wish')
const mongoose = require('mongoose')

exports.writeWishes = async function (req, res){
  console.log("writeWishes: " + req.id)

  try {
    const googleId = req.id
    const user = await member.getMember(googleId)
    if (!user)
      return res.status(400).json({ message: "Invalid user ID" })
    
    const newWish = {
      id: new mongoose.Types.ObjectId(),
      id_user: googleId,
      id_family: user.id_family,
      title: req.body.title,
      content: req.body.content,
      time_opened: Date.now()
    }

    const response = new Wish(newWish).save()
    if (!response)
      return res.status(400).json({ message: "Error occured in DB" })
    else
      return res.status(200).json(newWish)
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err })
  }
}

exports.getWishes = async function (req, res){
  
}

exports.deleteWishes = async function (req, res){
  
}