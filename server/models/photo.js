const mongoose = require('mongoose')

const PhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  contentType: String,
  id_user: String,
  id_family: String,
  id_event: String,
  timestamp: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Photo', PhotoSchema)