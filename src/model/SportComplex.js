const mongoose = require('mongoose');

const SportComplexSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"],
        unique: true,
      },
});

module.exports = mongoose.model('SportComplexes', SportComplexSchema)