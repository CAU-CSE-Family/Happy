const member = require('./member')
const Photo  = require('../models/photo')
const Event  = require('../models/event')
const Tag    = require('../models/tag')
const fs     = require('fs')
const mongoose = require('mongoose')

exports.upload = async function (req, res, next){
  console.log("upload: " + req.id)
  
  const files    = req.files
  const googleId = req.id
  const user     = await member.getMember(googleId)
  const familyId = user.id_family
  const body     = JSON.parse(req.body.body)
  let eventId    = ""
  let event      = null

  if (!googleId)
    return res.status(400).json({ message: "Invalid user ID" })

  if (!files)
    return res.status(400).json({ message: "Please choose the files" })

  if (body.isNewEvent) {
    try {
      const newEvent = {
        id: new mongoose.Types.ObjectId(),
        id_family: familyId,
        name: body.eventName,
        timestamp: Date.now()
      }
      const response = await new Event(newEvent).save()
      if (!response)
        return res.status(400).json({ message: "Error occured in DB" })
      else {
        const newTag = {
          id: new mongoose.Types.ObjectId(),
          id_user: body.userIds,
          id_event: response.id
        }
        const response2 = await new Tag(newTag).save()
        if (!response2)
          return res.status(400).json({ message: "Error occured in DB" })
      }
    } catch (err){
      console.log(err)
      return res.status(400).json({ message: err })
    }
  }

  const photoArray = await files.map((file) => {
    try {
      return fs.readFileSync(file.path)
    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: err })
    }
  })
  
  const uploaded = await photoArray.map((src, index) => {
    const newPhoto = {
      url: files[index].path,
      contentType: files[index].mimetype,
      id_user: googleId,
      id_family: familyId,
      id_event: eventId,
      timestamp: Date.now()
    }
    console.log(src)
    try {
      const response = new Photo(newPhoto).save()
      if (!response)
        throw new Error("Cannot upload image: " + `${files[index].originalname}`)
      else 
        return newPhoto
    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: err })
    }
  })

  try {
    const photo = await Promise.all(uploaded)
    res.status(200).json({ event: event, photos: photo })
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

  const photoArray = await urls.map((file) => {
    try {
      return fs.readFileSync(file.path).toString('base64')
    } catch (err) {
      return next(err)
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
