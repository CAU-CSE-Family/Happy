const mongoose = require('mongoose')

const FamilySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  user_list: [{ id_user: String }]
})

module.exports = mongoose.model('Family', FamilySchema)