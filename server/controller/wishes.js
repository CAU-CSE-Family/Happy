const Wish = require('../models/wish')
const User = require('../models/user')
const fs = require('fs')

exports.uploadWishes = async function (req, res, next){

  const googleId = req.body.authData["id"]
  const sessionKey = req.body.authData["session"]
  const familyId = req.body["family"]
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
    let wish = fs.readFileSync(file.path)
    return encode_wish = wish.toString('base64')
  })

  const result = wishArray.map((src, index) => {
    const final_wish = {
      filename: files[index].originalname,
      id_user: googleId,
      id_family: familyId,
      contentType: files[index].mimetype,
      wishBase64: src
    }

    const newWish = new Wish(final_wish)
    return newWish.save().then(() => {
      return { msg: `${files[index].originalname} Uploaded Successfully.`}
    }).catch(err => {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          return Promise.reject({ err: `Duplicate ${files[index].originalname}. File already exists.`})
        }
        return Promise.reject({ err: err.message || `Cannot Upload ${files[index].originalname} file missing.`})
      }
    })
  })

  Promise.all(result).then(msg => {
    res.json({result: true, message: msg})
  }).catch(err => {
    console.log(err)
    res.json({result: false, message: err})
  })
}

exports.getWishes = async function (req, res){
  const googleId = req.body.authData["id"]
  const sessionKey = req.body.authData["session"]
  const familyId = req.body["family"]

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
  const googleId = req.body.authData["id"]
  const sessionKey = req.body.authData["session"]
  const familyId = req.body["family"]
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
    let wish = fs.readFileSync(file.path)
    return encode_wish = wish.toString('base64')
  })

  const result = wishArray.map((src, index) => {
    return Wish.deleteOne({ filename: files[index].originalname }).then(() => {
      fs.unlinkSync('../uploads/'+files[index].originalname, (err) => {
        if (err) { console.log("Failed to delete local wishes:" + err) }
        else { console.log("Successfully deleted local wishes.") }
      })
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