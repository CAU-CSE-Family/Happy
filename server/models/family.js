const mongoose = require('mongoose')

const FamilySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  user_list: [{
    id_user: {
      type: String,
      unique: true
    }
  }]
})

module.exports = mongoose.model('Family', FamilySchema)