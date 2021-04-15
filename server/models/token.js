const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    accessToken: String,
    refreshToken: String,
    expiredIn: Number,
    clientId: String,
    userId: String,
    createdTime: Number
})

TokenSchema.pre('save', (next) => {
    if (!this.isNew) { return next() }
    this.createdTime = Date.now()
    next()
})

module.exports = mongoose.model('AccessToken', TokenSchema)