const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createRefreshToken = (username, role, email) => {
  return jwt.sign({ username, role, email }, process.env.JWT_REFRESH_SECRET,{
    expiresIn: '30d'
  });
};

const createAccessToken = (username, role, email) => {
  return jwt.sign({ username, role, email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = {
  authSuccess: async (req, res) => {
    return res.status(200).json({status: "successful"})
  },
  loginUser: async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      const auth = await bcrypt.compare(password, user.encryptedPassword);
      if (auth) {
        const accessToken = createAccessToken(user.username, user.role, user.email)
        const refreshToken = createRefreshToken(user.username, user.role, user.email)
        return res.status(200).json({
          status: "successful",
          accessToken: accessToken,
          refreshToken: refreshToken,
          role: user.role
        });
      }
      return res.status(401).json({
        error: "Wrong password",
      });
    }
    return res.status(404).json({
      error: "No user found",
    });
  },
  verifyRefreshToken: async (req,res) => {
    const refreshToken = req.query.refreshToken
    if(refreshToken == null) return res.status(401).json({error: "empty refresh token"})

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({status: "unsuccessful"})
      const accessToken = createAccessToken(user.username, user.role, user.email)
      return res.status(200).json({ accessToken: accessToken })
    })
  },
  changePassword: async (req,res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findOne({username: req.authUsername})
    if(user){
      try{
        const auth = await bcrypt.compare(oldPassword, user.encryptedPassword);
        if(auth) {
          try{
            const salt = await bcrypt.genSalt();
          const encryptedPassword = await bcrypt.hash(newPassword, salt);
          const changePassword = await User.findOneAndUpdate({username: req.authUsername},{encryptedPassword: encryptedPassword})

            return res.status(200).json({status: "Password changed", changePassword})
          } catch(err) {
            return res.status(403).json({err})
          }
        } else {
          return res.status(403).json({error: "Wrong old Password"})
        }
      } catch(err){
        return res.status(403).json({err})
      }
    } else {
      return res.status(404).json({error: "user not found"})
    }
  }
};
