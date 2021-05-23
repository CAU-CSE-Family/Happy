const mongoose = require('mongoose')

const WishSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    id_user: String,
    id_family: String,
    title: {
        type: String,
        required: true
    },
    content: String,
    time_opened: {
        type: Date,
        required: true,
        default: Date.now()
    },
    time_closed: Date
})

module.exports = mongoose.model('Wish', WishSchema)