const mongoose = require('mongoose')

const PhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  user_id: String,
  event_id: String,
  timestamp: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Photo', PhotoSchema)