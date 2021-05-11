const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    session: String,
    name: String,
    phone: String,
    photo_url: String,
    id_family: {
        type: String,
        required: false,
        default: null
    }
})

module.exports = mongoose.model('User', UserSchema)