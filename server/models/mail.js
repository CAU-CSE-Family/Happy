const mongoose = require('mongoose')

const MailSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    to_user_id: String,
    from_user_id: String,
    content: String,
})

module.exports = mongoose.model('Mail', MailSchema)