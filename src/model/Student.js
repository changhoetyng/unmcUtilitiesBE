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
      name: {type: String},
      subCategory: {type: String},
      timestamp: {type: String, default: () => moment().format("dddd, MMMM Do YYYY, h:mm:ss a")},
      checkIn: {type: String, default: () => moment().format("dddd, MMMM Do YYYY, h:mm:ss a")},
      checkOut: {type: String, default: () => moment().format("dddd, MMMM Do YYYY, h:mm:ss a")},
      status: {type: String, enum: ["checkedOut", "ready", "using"]}
    }
  ]
});

module.exports = mongoose.model("Students", StudentSchema);
