const jwt = require("jsonwebtoken");

const StudentAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const authComponents = authorization.split(" ");
    if (authComponents.length === 2) {
      jwt.verify(authComponents[1], process.env.JWT_SECRET_STUDENT, (err, decodedToken) => {
        if (err) {
          return res.status(401).send()
        } else {
          req.authStudentId = decodedToken.studentId
          next();
        }
      });
    }
  } else {
    return res.status(401).send()
  }
};

module.exports = {StudentAuth}