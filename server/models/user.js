const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    id: String,
    session: String,
    name: String,
    phone: String,
    photo: String,
    familyId: String,
})

module.exports = mongoose.model('User', UserSchema)