const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  id_family: String,
  name: String,
  timestamp: { 
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Event', EventSchema)