const User = require("../model/User");
const bcrypt = require("bcrypt");
var validator = require("validator");
const jwt = require("jsonwebtoken");
const { estimatedDocumentCount } = require("../model/User");

const createRefreshToken = (username, role, email) => {
  return jwt.sign({ username, role, email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

const createAccessToken = (username, role, email) => {
  return jwt.sign({ username, role, email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const handleMongoErrors = (err) => {
  let errors = {};

  if (err.code === 11000) {
    Object.entries(err.keyPattern).map(([key]) => {
      errors[key] = "Duplicated";
    });
  }

  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports = {
  getUser: async (req, res) => {
    const user = await User.findOne({ username: req.authUsername });
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(404).json({ error: "user not found" });
    }
  },
  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const deleteUser = await User.deleteOne({ _id: id });
      return res.status(204).json({status: "successful"});
    } catch (err) {
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
  getAllStaff: async (req, res) => {
    try {
      const findAllStaff = await User.find({ role: "staff" });
      return res.status(200).json(findAllStaff);
    } catch (err) {
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
  createUser: async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "studentid or password is empty" });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ status: "error has occured", message: "incorrect email" });
    }
    //Encrypt
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    try {
      const saveUser = await User.create({
        username,
        encryptedPassword,
        email: email,
        role: "staff",
      });
      return res.status(201).json(saveUser);
    } catch (err) {
      console.log(err);
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
  changeUsername: async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username: req.authUsername });
    if (user) {
      try {
        const update = await User.findOneAndUpdate(
          { username: req.authUsername },
          { username: username }
        );

        const updatedUser = await User.findOne({ username: username });
        const accessToken = createAccessToken(
          updatedUser.username,
          updatedUser.role,
          updatedUser.email
        );
        const refreshToken = createRefreshToken(
          updatedUser.username,
          updatedUser.role,
          updatedUser.email
        );

        return res.status(201).json({
          status: "successful",
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      } catch (err) {
        console.log(err)
        return res.status(400).json({ status: "error has occured" });
      }
    } else {
      return res.status(404).json({ error: "error has occured" });
    }
  },
  changeEmail: async (req, res) => {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      console.log("hello")
      return res
        .status(400)
        .json({ status: "error has occured", message: "Incorrect email" });
    }
    const user = await User.findOne({ username: req.authUsername });
    if (user) {
      try {
        const update = await User.findOneAndUpdate(
          { username: req.authUsername },
          { email: email }
        );
        return res.status(200).json({ status: "successful", update });
      } catch (err) {
        return res.status(400).json({ status: "error has occured" });
      }
    } else {
      return res.status(404).json({ error: "error has occured" });
    }
  },
};
