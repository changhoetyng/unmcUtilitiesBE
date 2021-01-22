const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const authComponents = authorization.split(" ");
    if (authComponents.length === 2) {
      jwt.verify(authComponents[1], process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return res.status(401).send()
        } else {
          req.authUsername = decodedToken.username
          next();
        }
      });
    }
  } else {
    return res.status(401).send()
  }
};

const isAdmin = (req, res,next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const authComponents = authorization.split(" ");
    if (authComponents.length === 2) {
      jwt.verify(authComponents[1], process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return res.status(401).send()
        } else {
          if(decodedToken.role === "admin"){
            next();
          } else {
            return res.status(401).send()
          }
        }
      });
    }
  } else {
    return res.status(401).send()
  }
}

module.exports = { requireAuth, isAdmin };
