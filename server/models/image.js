const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    filename: {
        type: String
    },
    id_user: String,
    id_family: String,
    album: {
        type: String,
        default: null
    },
    contentType: {
        type: String,
        unique: false
    },
    imageBase64: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Image', ImageSchema)