const mongoose = require("mongoose");

const SportComplexSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please enter a name"],
  },
  currentUser: {
    type: String,
  },
  subCategory: [
    {
      subName: {
        type: String,
        sparse: true,
      },
    },
  ],
});

module.exports = mongoose.model("SportComplexes", SportComplexSchema);
