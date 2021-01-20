const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization) {
    const authComponents = authorization.split(" ");
    if (authComponents.length === 2) {
      jwt.verify(authComponents[1], process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return res.status(403).send()
        } else {
          next();
        }
      });
    }
  } else {
    return res.status(403).send()
  }
};

const isAdmin = (req, res,next) => {
  const { authorization } = req.headers;

  if (authorization) {
    const authComponents = authorization.split(" ");
    if (authComponents.length === 2) {
      jwt.verify(authComponents[1], process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return res.status(403).send()
        } else {
          if(decodedToken.role === "admin"){
            next();
          } else {
            return res.status(403).send()
          }
        }
      });
    }
  } else {
    return res.status(403).send()
  }
}

module.exports = { requireAuth, isAdmin };
