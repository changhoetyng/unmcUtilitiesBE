const mongoose = require("mongoose");
const {isEmail} = require('validator')

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter an username"],
    unique: true,
    lowercase: true,
  },
  encryptedPassword: { type: String, required: true},
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  role: {
    type: String,
    enum: ["admin", "staff"],
    required: [true, "Please insert role"],
  }
});

module.exports = mongoose.model("User", UserSchema);
