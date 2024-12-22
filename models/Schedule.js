const mongoose = require('mongoose')

const ScheduleSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    description: {
        type: String,
        required:[true, 'Please enter product description'],
    },
    date: {
        type: String,
        required:[true, 'Please enter the date'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    enable: {
        type: String,
        default: "enabled"
    },
    Canceled: {
        type: String,
        default: "disabled"
    },
    FullDayBooked: {
        type: String,
        default: "disabled"
    }
})

module.exports = mongoose.model('Schedule', ScheduleSchema);