const member = require('./member')
const Photo  = require('../models/photo')
const Event  = require('../models/event')
const Tag    = require('../models/tag')
const fs     = require('fs')
const stream = require('stream')
const mongoose = require('mongoose')

exports.upload = async function (req, res, next){
  console.log("upload: " + req.id)
  const files = req.files
  console.log("upload files:\n", files)

  const googleId = req.id
  const user = await member.getMember(googleId)
  const familyId = user.id_family
  let eventId = ""

  if (!googleId) {
    const err = new Error ("Invalid user ID")
    return next(err)
  }

  if (!files) {
    const err = new Error ("Please choose the files")
    return next(err)
  }

  const photoArray = await files.map((file) => {
    try {
      return fs.readFileSync(file.path).toString('base64')
    } catch (err) {
      return next(err)
    }
  })

  if (req.body.isNewEvent) {
    const newEvent = {
      id: new mongoose.Types.ObjectId(),
      id_family: familyId,
      name: req.body.eventName,
      timestamp: Date.now()
    }
    try {
      const event = await new Event.save(newEvent)
      if (!event)
        return Promise.reject({ msg: "Error occured in DB" })
      eventId = event.id
    } catch (err){
      return Promise.reject({ err: err.message })
    }

    const newTag = {
      id: new mongoose.Types.ObjectId(),
      id_user: [req.body.tags],
      id_event: eventId
    }
    try {
      const tag = await new Tag.save(newTag)
      if (!tag)
        return Promise.reject({ msg: "Error occured in DB" })
    } catch (err){
      return Promise.reject({ err: err.message })
    }
  }
  
  const uploaded = photoArray.map(async (src, index) => {
    const newPhoto = {
      url: files[index].path,
      contentType: files[index].mimetype,
      id_user: googleId,
      id_family: familyId,
      id_event: eventId,
      timestamp: Date.now()
    }
    try {
      const response = await new Photo(newPhoto).save()
        if (response)
          return { msg: `${files[index].originalname} Uploaded Successfully`, url: files[index].path }
        else
          throw new Error("Cannot save image")
    } catch (err) {
      console.log(err)
      return Promise.reject({ err: err.message || `Cannot Upload ${files[index].originalname} file`})
    }
  })

  try {
    const msg = await Promise.all(uploaded)
    res.status(200).json({ message: msg })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: err })
  }
}

exports.getImages = async function (req, res, next){
  console.log("getImages: " + req.id)

  const googleId = req.id
  const user = await member.getMember(googleId)
  const familyId = user.id_family

  if (!googleId)
    return res.status(400).json({ message: "Invalid user ID" })
  
  const urls = []
  try {
    const images = await Image.find({ id_family: familyId })
    images.map((src) => { urls.push(src.url) })
  } 
  catch (err) {
    console.log(err)
    res.status(400).json({ message: err })
  }

  urls.map((url) => {
    try {
      const img = fs.createReadStream(url)
      const ps = new stream.PassThrough()
      stream.pipeline(img, ps, (err) => {
        if (err) {
          console.log(err)
          return res.status(400).json({ message: err })
        }
      })
      ps.pipe(res)
    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: err })
    }
  })
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
