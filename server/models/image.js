const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    fileUrl: {
        type: String,
        required: true,
        unique: true
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
    }
})

module.exports = mongoose.model('Image', ImageSchema)