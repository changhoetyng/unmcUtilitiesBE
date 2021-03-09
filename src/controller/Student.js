const bcrypt = require("bcrypt");
var validator = require("validator");
const jwt = require("jsonwebtoken");
const Student = require("../model/Student");
const SportComplex = require("../model/SportComplex")
const Room = require("../model/Room")
const SportComplexBooking = require("../model/SportComplexBooking")
const RoomBooking = require("../model/RoomBooking")

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
  return jwt.sign(
    { studentId, email },
    process.env.JWT_REFRESH_SECRET_STUDENT,
    {
      expiresIn: "30d",
    }
  );
};

const createAccessToken = (studentId, email) => {
  return jwt.sign({ studentId, email }, process.env.JWT_SECRET_STUDENT, {
    expiresIn: "1d",
  });
};
module.exports = {
  verifyRefreshToken: async (req, res) => {
    const refreshToken = req.query.refreshToken;
    if (refreshToken == null)
      return res.status(401).json({ error: "empty refresh token" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_STUDENT, (err, user) => {
      if (err) return res.status(403).json({ status: "unsuccessful" });
      const accessToken = createAccessToken(
        user.studentId,
        user.email
      );
      return res.status(200).json({ accessToken: accessToken });
    });
  },
  authSuccess: async (req, res) => {
    return res.status(200).json({ status: "successful" });
  },
  signup: async (req, res) => {
    const { studentId, email, password } = req.body;
    const testStudentId = new RegExp("^[0-9]*$");
    if (!studentId || !password) {
      return res.status(400).json({ error: "studentid or password is empty" });
    }

    if (!testStudentId.test(studentId)) {
      return res.status(400).json({ error: "studentid invalid" });
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

    if (!studentId || !password) {
      return res.status(400).json({ error: "studentid or password is empty" });
    }

    if (!testStudentId.test(studentId)) {
      return res.status(400).json({ error: "Invalid Student ID" });
    }

    const student = await Student.findOne({ studentId });

    if (student) {
      const auth = await bcrypt.compare(password, student.encryptedPassword);
      if (auth) {
        const accessToken = createAccessToken(student.studentId, student.email);
        const refreshToken = createRefreshToken(
          student.studentId,
          student.email
        );
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
  checkin: async (req, res) => {
    const test = await Student.findOne({studentId: req.authStudentId})
    return res.status(200).json({
      test
    });
  },
  getFacilityName: async (req, res) => {
    const getFacility = await SportComplex.find({});
    if(getFacility){
      return res.status(200).json({ data: getFacility });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
  getRoomName: async (req, res) => {
    const getRoom = await Room.find({});
    if (getRoom) {
      return res.status(200).json({ data: getRoom });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
  showSelectedFacility: async (req, res) => {
    const { facilityId } = req.params;
    const getFacility = await SportComplex.findOne({_id: facilityId});
    if (getFacility) {
      var facility = {}
        const facilityData = await SportComplexBooking.find({facilityId: facilityId});
        facility = {
          facilityId: getFacility._id,
          facility: getFacility.name,
          subCategory: getFacility.subCategory,
          data: facilityData
        }
      return res.status(200).json({ data: facility });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
  showSelectedRoom: async (req, res) => {
    const { roomId } = req.params;
    const getRoom = await Room.findOne({_id: roomId});
    if (getRoom) {
      var room = {}
        const roomData = await RoomBooking.find({roomId: roomId});
        room = {
          roomId: getRoom._id,
          room: getRoom.name,
          subCategory: getRoom.subCategory,
          data: roomData
        }
      return res.status(200).json({ data: room });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
};
