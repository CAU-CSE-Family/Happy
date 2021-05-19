const verify = require('./verify')
const Image  = require('../models/image')
const fs     = require('fs')

exports.uploadImages = async function (req, res, next){
  console.log("uploadImages:\n", req.body)
  const files = req.files
  console.log("uploading files:\n", files)

  const userData = await verify.verifyUser(JSON.parse(req.body.authData))
  const googleId = userData[0]
  const familyId = userData[1]
  console.log("user\'s auth data: ", userData)

  if (!googleId) {
    const err = new Error ("No matching user&familyID&session in the DB")
    err.httpStatusCode = 400
    return next(err)
  }

  if (!files) {
    const err = new Error ("Please choose the files")
    err.httpStatusCode = 400
    return next(err)
  }

  const imgArray = await files.map((file) => {
    try {
      return fs.readFileSync(file.path).toString('base64')
    } catch (err) {
      return next(err)
    }
  })

  const saveImgArray = await imgArray.map((src, index) => {
    const newImg = {
      url: files[index].path,
      id_user: googleId,
      id_family: familyId,
      contentType: files[index].mimetype,
    }
  
    try {
      const savedImg = new Image(newImg).save()
      if (savedImg) {
        return { msg: `${files[index].originalname} Uploaded Successfully`, url: files[index].path }
      }
      else {
        throw new Error("CantSaveFile")
      }
    } catch (err) {
      console.log(err)
      return Promise.reject({ err: err.message || `Cannot Upload ${files[index].originalname} file`})
    }
  })

  try {
    const msg = await Promise.all(saveImgArray)
    res.json({result: true, message: msg })
  } catch (err) {
    console.log(err)
    res.json({result: false, message: err})
  }
}

exports.getImages = async function (req, res){

  const userData = await verify.verifyUser(req.body.authData)
  const googleId = userData[0]
  const familyId = userData[1]
  console.log("user\'s auth data: ", userData)

  if (!googleId) {
    const err = new Error ("No matching user&familyID&session in the DB")
    err.httpStatusCode = 400
    res.json({result: false, message: err})
  }
  
  try {
    const images = await Image.find({ id_family: familyId })
    images.map((src) => {
      urls.push(src["url"])
    })
    res.json({result: true, message: "Successfully get images.", urls: urls})
  } 
  catch (err) {
    console.log(err)
    res.json({result: false, message: err})
  }
}

exports.deleteImages = async function (req, res, next){

  const urls = req.body.url
  console.log("file urls:\n", urls)

  const userData = await verify.verifyUser(req.body.authData)
  const googleId = userData[0]
  const familyId = userData[1]
  console.log("user\'s auth data: ", userData)

  if (!googleId) {
    const err = new Error ("No matching user&familyID&session in the DB")
    err.httpStatusCode = 400
    res.json({result: false, message: err})
  }

  if (!urls) {
    const err = new Error ("Please choose the files")
    err.httpStatusCode = 400
    res.json({result: false, message: err})
  }

  urls.forEach(async (src) => {
    try {
      const image = await Image.deleteOne({ url: src, id_family: familyId })
      if (!image) {
        res.json({result: false, message: "Error occured in DB to delete images"})
      } else {
        fs.unlinkSync(src, (err) => {
          if (err) { console.log("Failed to delete local image:\n", err) }
          else { console.log("Successfully deleted local image\n") }
        })
        res.json({result: true, message: "Deleted successfully" })
      }
    } catch (err) {
      res.json({result: false, message: err})
    }
  })
}
