const verify = require('./verify')
const Image  = require('../models/image')
const fs     = require('fs')

exports.uploadImages = async function (req, res, next){
  
  const files = req.files
  let googleId, familyId = verify.verifyUser(req.body)

  if (!googleId) {
    const err = new Error("No matching user&familyID&session in the DB.")
    err.httpStatusCode = 400
    return next(err)
  }

  if (!files) {
    const err = new Error("Please choose files.")
    err.httpStatusCode = 400
    return next(err)
  }

  let imgArray = files.map((file) => {
    let img = fs.readFileSync(file.path)
    return encode_image = img.tostring('base64')
  })

  const result = imgArray.map((src, index) => {
    const final_img = {
      filename: files[index].originalname,
      id_user: googleId,
      id_family: familyId,
      contentType: files[index].mimetype,
      imageBase64: src
    }

    const newImage = new Image(final_img)
    return newImage.save().then(() => {
      fs.unlinkSync(file.path)
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

exports.getImages = async function (req, res){

  let googleId, familyId = verify.verifyUser(req.body)

  if (!googleId) {
    const err = new Error("No matching user&familyID&session in the DB.")
    err.httpStatusCode = 400
    return next(err)
  }

  Image.find({ id_family: familyId }, (err, items) => {
    if (err) {
      console.log(err)
      res.json({result: false, message: err})
    }
    else {
      res.json({result: true, message: "Successfully get images.", images: items})
    }
  })
}

exports.deleteImages = async function (req, res, next){

  const files = req.files
  let googleId, familyId = verify.verifyUser(JSON.stringify(req.body))

  if (!files) {
    const err = new Error("Please choose files.")
    error.httpStatusCode = 400
    return next(err)
  }

  let imgArray = files.map((file) => {
    let img = fs.readFileSync(file.path)
    return encode_image = img.tostring('base64')
  })

  const result = imgArray.map((src, index) => {
    return Image.deleteOne({ id_family: familyId, filename: files[index].originalname }).then(() => {
      /*
      fs.unlinkSync('../uploads/'+files[index].originalname, (err) => {
        if (err) { console.log("Failed to delete local image:" + err) }
        else { console.log("Successfully deleted local image.") }
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