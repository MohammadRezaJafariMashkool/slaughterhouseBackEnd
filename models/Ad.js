const mongoose = require('mongoose')

const AdSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required:[true, 'Please enter product description'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    enable: {
        type: String,
        default: "enabled"
    }
})

module.exports = mongoose.model('Ad', AdSchema);