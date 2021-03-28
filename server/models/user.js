const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hashed_password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: 1,
  },
  email: {
    type: String,
    required: true,
  },
  temp_password: {
      type: String,
  },
  temp_password_time: {
      type: String,
  },
});

mongoose.Promise = global.Promise;

module.exports = mongoose.model('user', userSchema);