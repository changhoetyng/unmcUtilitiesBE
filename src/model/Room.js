const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"],
        unique: true,
      },
});

module.exports = mongoose.model('Rooms', RoomSchema)