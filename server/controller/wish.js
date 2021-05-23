const Wish = require('../models/wish')
const User = require('../models/user')
const fs = require('fs')
const mongoose = require('mongoose')

exports.uploadWishes = async function (req, res, next){
  console.log("getImages: " + req.id)

  try {
    const googleId = req.id
    const user = await member.getMember(googleId)

    const newWish = {
      id: new mongoose.Types.ObjectId(),
      id_user: googleId,
      id_family: user.id_family,
      title: req.body.title,
      content: req.body.content,
      time_opened: Date.now()
    }

    const response = new Wish(newWish).save()
    if (!response.id)
      return res.status(400).json({ message: "Error occured in DB" })
    else
      return res.status(200).json(newWish)
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err })
  }
}

exports.getWishes = async function (req, res){
  const googleId = req.body["id"]
  const sessionKey = req.body["session"]
  const familyId = req.body["id_family"]

  User.findOne({ id: googleId, session: sessionKey, id_family: familyId }).then(existingUser => {
    if (!existingUser) {
      res.json({result: false, message: "No matching user&familyID&session in the DB."})
    }
    else {
      Wish.find({ id_family: existingUser["id_family"] }, (err, items) => {
        if (err) {
          console.log(err)
          res.json({result: false, message: err})
        }
        else {
          res.json({result: true, message: "Successfully get wishes.", wishes: items})
        }
      })
    }
  })
}

exports.deleteWishes = async function (req, res, next){
  const googleId = req.body["id"]
  const sessionKey = req.body["session"]
  const familyId = req.body["id_family"]
  const files = req.files

  User.findOne({ id: googleId, session: sessionKey, id_family: familyId }).then(existingUser => {
    if (!existingUser) {
      res.json({result: false, message: "No matching user&familyID&session in the DB."})
    }
  })

  if (!files) {
    const err = new Error("Please choose files.")
    error.httpStatusCode = 400
    return next(err)
  }

  let wishArray = files.map((file) => {
    let wish = fs.createReadStream(file.path)
    return wish
  })

  const result = wishArray.map((src, index) => {
    return Wish.deleteOne({ filename: files[index].originalname }).then(() => {
      /*
      fs.unlinkSync('../uploads/'+files[index].originalname, (err) => {
        if (err) { console.log("Failed to delete local wishes:" + err) }
        else { console.log("Successfully deleted local wishes.") }
      })
      */
      return { msg: `${files[index].originalname} Deleted successfully.`}
    }).catch(err => {
      return Promise.reject({ err: err.message || `Cannot delete ${files[index].originalname} file missing.`})
    })
  })
  
  Promise.all(result).then(msg => {
    res.json({result: true, message: msg})
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: err})
  })
}