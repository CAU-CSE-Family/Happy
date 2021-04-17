const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({
    url: String,
    id_user: String,
    id_family: {
        type: String,
        required: false,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Image', ImageSchema)