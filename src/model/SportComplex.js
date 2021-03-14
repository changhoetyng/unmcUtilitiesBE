const mongoose = require("mongoose");

const SportComplexSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please enter a name"],
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

module.exports = mongoose.model("SportComplexes", SportComplexSchema);
