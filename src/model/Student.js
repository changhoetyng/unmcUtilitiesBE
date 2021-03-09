const mongoose = require("mongoose");
const {isEmail} = require('validator')
const moment = require("moment");

const StudentSchema = mongoose.Schema({
  studentId: {
    unique: true,
    type: String,
    required: [true, "Please insert Student Id"],
  },
  encryptedPassword: { type: String, required: true},
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email'],
    required: [true, "Please insert Student Id"]
  },
  bookings: [
    {
      venueName: {type: String},
      type: {type: String,  enum: ["room", "sportComplex"]},
      subCategoryName: {type: String},
      subCategoryId: {type: String},
      venueId: {type: String},
      timestamp: {type: String, default: () => moment().format("dddd, MMMM Do YYYY, h:mm:ss a")},
      checkIn: {type: String},
      checkOut: {type: String},
      bookingTime: {type: String},
      bookingDate: {type: String},
      status: {type: String, enum: ["checkedOut", "booked", "checkedIn", "cancelled"]}
    }
  ]
});

module.exports = mongoose.model("Students", StudentSchema);
