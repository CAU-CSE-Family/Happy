const mongoose = require('mongoose')

const TagSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  id_user: [String],
  id_event: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Tag', TagSchema)