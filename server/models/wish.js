const mongoose = require('mongoose')

const wishSchema = new mongoose.Schema({
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
    imageBase64: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Image', ImageSchema)