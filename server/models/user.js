const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    googleId: String,
    sessionToken: String,
    refreshToken: String,
    displayName: String,
    email: String,
    phone: String,
    photo: String,
    familyId: String,
})

module.exports = mongoose.model('User', UserSchema)