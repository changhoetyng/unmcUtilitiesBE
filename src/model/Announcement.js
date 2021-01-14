const mongoose = require('mongoose');

const AnnouncementSchema = mongoose.Schema({
    title: String,
    announcement: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema)