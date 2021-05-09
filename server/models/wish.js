const mongoose = require('mongoose')

const WishSchema = new mongoose.Schema({
    filename: {
        type: String,
        unique: true
    },
    id_user: String,
    id_family: String,
    contentType: {
        type: String,
        unique: true
    },
    wishBase64: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Wish', WishSchema)