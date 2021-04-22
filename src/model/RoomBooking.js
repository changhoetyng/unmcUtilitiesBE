const mongoose = require("mongoose");

const roomBookingSchema = mongoose.Schema({
  roomId: {
    type: String,
    required: [true, "Please enter a name"],
  },
  subCategoryId: {
    type: String,
    required: [true, "subCategoryId empty"]
  },
  date: {
    type: String,
    required: [true, "Please enter a date"],
  },
  timeListing: [
    {
      time: { type: String, required: [true, "Time is empty"] },
      timeStatus: {
        status: {
          type: String,
          enum: ["close", "open", "booked", "checked in", "checked out"],
          required: [true, "Please insert role"],
        },
        studentId: {
          type: String,
        },
        bookingId: {
          type: String
        }
      },
    },
  ],
});

module.exports = mongoose.model("roomBookings", roomBookingSchema);
