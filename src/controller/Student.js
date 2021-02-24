const bcrypt = require("bcrypt");
var validator = require("validator");
const jwt = require("jsonwebtoken");
const Student = require("../model/Student");

const handleMongoErrors = (err) => {
  let errors = {};

  if (err.code === 11000) {
    Object.entries(err.keyPattern).map(([key]) => {
      errors[key] = "Duplicated";
    });
  }

  if (err.message.includes("Student validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const createRefreshToken = (studentId, email) => {
  return jwt.sign({ studentId, email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

const createAccessToken = (studentId, email) => {
  return jwt.sign({ studentId, email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
module.exports = {
  signup: async (req, res) => {
    const { studentId, email, password } = req.body;
    const testStudentId = new RegExp("^[0-9]*$");
    if(!studentId || !password){
        return res.status(400).json({ error: "studentid or password is empty"  });
    }

    if(!testStudentId.test(studentId)){
        return res.status(400).json({ error: "studentid invalid"  });
    }

    if (!validator.isEmail(email)) {
        return res
          .status(200)
          .json({ status: "error has occured", message: "incorrect email" });
      }
    //Encrypt   
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    try {   
      const saveStudent = await Student.create({
        studentId,
        encryptedPassword,
        email,
        bookings: [],
      });
      return res.status(201).json(saveStudent);
    } catch (err) {
      console.log(err);
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
  loginUser: async (req, res) => {
    const { studentId, password } = req.body;
    const testStudentId = new RegExp("^[0-9]*$");
    
    if(!studentId || !password){
        return res.status(400).json({ error: "studentid or password is empty"  });
    }

    if(!testStudentId.test(studentId)){
        return res.status(400).json({ error: "studentid invalid"  });
    }

    const student = await Student.findOne({ studentId });

    if (student) {
      const auth = await bcrypt.compare(password, student.encryptedPassword);
      if (auth) {
        const accessToken = createAccessToken(student.username, student.email)
        const refreshToken = createRefreshToken(student.username, student.email)
        return res.status(200).json({
          status: "successful",
          accessToken: accessToken,
          refreshToken: refreshToken,
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
};
