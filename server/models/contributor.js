const mongoose = require('mongoose')

const ContributorSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  id_user: [String],
  id_wish: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Contibutor', ContributorSchema)