const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createJwtToken = (username, role, email) => {
  const maxAge = 3 * 24 * 60 * 60;
  return jwt.sign({ username, role, email }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
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
      res.status(201).json(saveUser);
    } catch (err) {
      const errors = handleMongoErrors(err);
      res.status(400).json({ errors });
    }
  },
  loginUser: async (req, res) => {
    const { username, password } = req.body;
    const {authorization} = req.headers;

    const user = await User.findOne({ username });

    if (user) {
      const auth = await bcrypt.compare(password, user.encryptedPassword);
      if (auth) {
        const jwtToken = createJwtToken(user.username, user.role, user.email)
        return res.status(200).json({
          status: "successful",
          jwt: jwtToken,
        });
      }
      return res.status(401).json({
        error: "Wrong password",
      });
    }
    return res.status(400).json({
      error: "No user found",
    });
  },
};
