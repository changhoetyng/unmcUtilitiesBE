const SportComplex = require("../model/SportComplex");
const SportComplexBooking = require("../model/SportComplexBooking");
const jwt = require("jsonwebtoken");

module.exports = {
  authSuccess: async (req, res) => {
    return res.status(200).json({status: "successful"})
  },
};
