const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
    unique: true,
  },
  subCategory: [
    {
      subName: {
        type: String,
        sparse: true,
      },
      currentUser: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("Rooms", RoomSchema);
