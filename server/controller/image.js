const member = require('./member')
const Image  = require('../models/image')
const fs     = require('fs')

exports.uploadImages = async function (req, res, next){
  console.log("uploadImages: " + req.id)
  const files = req.files
  console.log("uploading files:\n", files)

  const googleId = req.id
  const user = await member.getMember(googleId)
  const familyId = user.id_family

  if (!googleId) {
    const err = new Error ("Invalid user ID")
    return next(err)
  }

  if (!files) {
    const err = new Error ("Please choose the files")
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
      } else {
        throw new Error("CantSaveFile")
      }
    } catch (err) {
      console.log(err)
      return Promise.reject({ err: err.message || `Cannot Upload ${files[index].originalname} file`})
    }
  })

  try {
    const msg = await Promise.all(saveImgArray)
    res.status(200).json({ message: msg })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: err })
  }
}

exports.getImages = async function (req, res){
  console.log("getImages: " + req.id)

  const googleId = req.id
  const user = await member.getMember(googleId)
  const familyId = user.id_family

  if (!googleId) {
    res.status(400).json({ message: "Invalid user ID" })
  }
  
  let urls = []
  try {
    const images = await Image.find({ id_family: familyId })
    images.map((src) => {
      urls.push(src.url)
    })
    res.status(200).json({ url: urls })
  } 
  catch (err) {
    console.log(err)
    res.status(400).json({ message: err })
  }
}

exports.deleteImages = async function (req, res, next){
  console.log("deleteImages: " + req.id)

  const urls = req.body.url
  console.log("file urls:\n", urls)

  const googleId = req.id
  const user = await member.getMember(googleId)
  const familyId = user.id_family

  if (!googleId) {
    res.status(400).json({ message: "Invalid user ID" })
  }

  if (!urls) {
    res.status(400).json({ message: "Please choose the files" })
  }

  urls.forEach(async (src) => {
    try {
      const response = await Image.deleteOne({ url: src, id_family: familyId })
      if (response.ok != 1) {
        res.status(400).json({ message: "Error occured in DB to delete images" })
      } else {
        fs.unlinkSync(src, (err) => {
          if (err) { console.log("Failed to delete local image:", err) }
          else { console.log("Successfully deleted local image") }
        })
        res.status(200).json({ message: "Deleted successfully" })
      }
    } catch (err) {
      res.status(400).json({ message: err })
    }
  })
}
