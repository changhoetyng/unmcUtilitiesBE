const mongoose = require("mongoose");

const sportComplexBookingSchema = mongoose.Schema({
  facilityId: {
    type: String,
    required: [true, "Please enter a name"],
  },
  date: {
    type: Date,
    required: [true, "Please enter a date"],
  },
  timeListing: [
    {
      time: { type: String, required: [true, "Time is empty"] },
      timeStatus: {
        status: {
          type: String,
          enum: ["close", "open", "booked"],
          required: [true, "Please insert role"],
        },
        studentId: {
          type: String
        }
      },
    },
  ],
});

module.exports = mongoose.model(
  "sportComplexBooking",
  sportComplexBookingSchema
);
