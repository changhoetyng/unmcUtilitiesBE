const User = require("../model/User");
const bcrypt = require("bcrypt");
var validator = require("validator");

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
    const { _id } = req.body;

    try {
      const deleteUser = await User.deleteOne({_id});
      return res.status(200).json(deleteUser);
    } catch (err) {
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
  getAllStaff: async (req, res) => {
    try {
      const findAllStaff = await User.find({role: "staff"});
      return res.status(200).json(findAllStaff);
    } catch (err) {
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
  createUser: async (req, res) => {
    const { username, email, password, role } = req.body;

    //Encrypt
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    try {
      const saveUser = await User.create({
        username,
        encryptedPassword,
        email,
        role,
      });
      return res.status(201).json(saveUser);
    } catch (err) {
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
        return res.status(200).json({ status: "successful", update });
      } catch (err) {
        return res.status(400).json({ status: "error has occured" });
      }
    } else {
      return res.status(404).json({ error: "error has occured" });
    }
  },
  changeEmail: async (req, res) => {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return res
        .status(200)
        .json({ status: "error has occured", message: "incorrect email" });
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
