const bcrypt = require("bcrypt");
var validator = require("validator");
const jwt = require("jsonwebtoken");
const Student = require("../model/Student");
const SportComplex = require("../model/SportComplex");
const Room = require("../model/Room");
const SportComplexBooking = require("../model/SportComplexBooking");
const RoomBooking = require("../model/RoomBooking");
const moment = require("moment");

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
  getUser: async (req, res) => {
    const user = await Student.findOne({ studentId: req.authStudentId });
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(404).json({ error: "user not found" });
    }
  },
  verifyRefreshToken: async (req, res) => {
    const refreshToken = req.query.refreshToken;
    if (refreshToken == null)
      return res.status(401).json({ error: "empty refresh token" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_STUDENT,
      (err, user) => {
        if (err) return res.status(403).json({ status: "unsuccessful" });
        const accessToken = createAccessToken(user.studentId, user.email);
        return res.status(200).json({ accessToken: accessToken });
      }
    );
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
  test: async (req, res) => {
    const test = await Student.findOne({ studentId: req.authStudentId });
    return res.status(200).json({
      test,
    });
  },
  getFacilityName: async (req, res) => {
    const getFacility = await SportComplex.find({});
    if (getFacility) {
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
    const getFacility = await SportComplex.findOne({ _id: facilityId });
    if (getFacility) {
      var facility = {};
      const facilityData = await SportComplexBooking.find({
        facilityId: facilityId,
      });
      facility = {
        facilityId: getFacility._id,
        facility: getFacility.name,
        subCategory: getFacility.subCategory,
        data: facilityData,
      };
      return res.status(200).json({ data: facility });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
  showSelectedRoom: async (req, res) => {
    const { roomId } = req.params;
    const getRoom = await Room.findOne({ _id: roomId });
    if (getRoom) {
      var room = {};
      const roomData = await RoomBooking.find({ roomId: roomId });
      room = {
        roomId: getRoom._id,
        room: getRoom.name,
        subCategory: getRoom.subCategory,
        data: roomData,
      };
      return res.status(200).json({ data: room });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
  getBooked: async (req, res) => {
    try {
      const getStudent = await Student.findOne({
        studentId: req.authStudentId,
      });
      let booked = [];
      getStudent.bookings.map((item, index) => {
        if (item.status === "booked" || item.status === "checkedIn") {
          return booked.push(item);
        }
      });
      return res.status(200).json({
        booked,
      });
    } catch {
      return res.status(500).json({ status: "unsuccessful" });
    }
  },
  getPast: async (req, res) => {
    try {
      const getStudent = await Student.findOne({
        studentId: req.authStudentId,
      });
      let booked = [];
      getStudent.bookings.map((item, index) => {
        if (item.status === "cancelled" || item.status === "checkedOut") {
          return booked.push(item);
        }
      });
      return res.status(200).json({
        booked,
      });
    } catch {
      return res.status(500).json({ status: "unsuccessful" });
    }
  },
  checkInEnabled: async (req, res) => {
    try {
      const { bookedId } = req.params;

      const getStudent = await Student.findOne({
        studentId: req.authStudentId,
      });

      const booked = getStudent.bookings.find(item => item._id == bookedId)
      if(booked) {
        if(booked.status === "booked"){
          const timeDate = booked.bookingTime + " " + booked.bookingDate
          // For testing purpose
          const timeDifference = moment("11:00 15/03/2021",  "HH:mm DD/MM/YYYY").diff(moment(timeDate, "HH:mm DD/MM/YYYY"),'minutes')

          // For actual use
          // const timeDifference = moment().diff(moment(timeDate, "HH:mm DD/MM/YYYY"),'minutes')
          if(timeDifference >= -10 && timeDifference < 15) {
            if(booked.type === "room") {
              const room = await Room.findById(booked.venueId)
              const checkCourt = room.subCategory.id(booked.subCategoryId)
              
              if(checkCourt.currentUser === null) {
                return res.status(200).json({ status: "successful", checkInStatus: true });
              } else {
                console.log(checkCourt)
                return res.status(200).json({ status: "successful", checkInStatus: false });
              }
            } 
            else if (booked.type === "sportComplex") {
              const sportComplex = await SportComplex.findById(booked.venueId)
              const checkCourt = sportComplex.subCategory.id(booked.subCategoryId)
              
              if(checkCourt.currentUser === null) {
                return res.status(200).json({ status: "successful", checkInStatus: true });
              } else {
                return res.status(200).json({ status: "successful", checkInStatus: false });
              }
            } else {
              return res.status(500).json({ status: "unsuccessful" });
            }
          } else {
            return res.status(200).json({ status: "successful", checkInStatus: false });
          }
        } else {
          return res.status(200).json({ status: "successful", checkInStatus: false });
        }
      } else {
        return res.status(404).json({ status: "unsuccessful" });
      }
      
    } catch (err){
      console.log(err)
      return res.status(500).json({ status: "unsuccessful" });
    }
  },
  checkIn: async (req, res) => {
    try{
      const { booked } = req.body;
      const { venueId, subCategoryId } = booked
      const studentId = req.authStudentId
      
      if(booked.type === "room") {
        await Room.findOneAndUpdate(
          {
            _id: venueId,
            subCategory: {
              $elemMatch: {
                _id: subCategoryId,
              }
            }
          },
          {
            $set: {
              "subCategory.$.currentUser": req.authStudentId,
            },
          }
        );

        await Student.findOneAndUpdate(
          {
            studentId,
            bookings: {
              $elemMatch: {
                _id: booked._id,
              }
            }
          },
          {
            $set: {
              "bookings.$.status": "checkedIn",
            },
          }
        );

        return res.status(200).json({ status: "successful"});
      } 
      else if (booked.type === "sportComplex") {
        await SportComplex.findOneAndUpdate(
          {
            _id: venueId,
            subCategory: {
              $elemMatch: {
                _id: subCategoryId,
              }
            }
          },
          {
            $set: {
              "subCategory.$.currentUser": req.authStudentId,
            },
          }
        );

        await Student.findOneAndUpdate(
          {
            studentId,
            bookings: {
              $elemMatch: {
                _id: booked._id,
              }
            }
          },
          {
            $set: {
              "bookings.$.status": "checkedIn",
            },
          }
        );

        return res.status(200).json({ status: "successful"});
      } else {
        return res.status(500).json({ status: "unsuccessful" });
      }
    } catch (err){
      console.log(err)
      return res.status(500).json({ status: "unsuccessful" });
    }
  },
  checkOut: async (req, res) => {
    try{
      const { booked } = req.body;
      const { venueId, subCategoryId } = booked
      const studentId = req.authStudentId

      if(booked.type === "room") {
        const findCurrent = await Room.findOne(
          {
            _id: venueId,
            subCategory: {
              $elemMatch: {
                _id: subCategoryId,
                currentUser: req.authStudentId
              }
            }
          },
        );
        if (findCurrent){
          await Room.findOneAndUpdate(
            {
              _id: venueId,
              subCategory: {
                $elemMatch: {
                  _id: subCategoryId,
                  currentUser: req.authStudentId
                }
              }
            },
            {
              $set: {
                "subCategory.$.currentUser": null,
              },
            }
          );
          
          await Student.findOneAndUpdate(
            {
              studentId,
              bookings: {
                $elemMatch: {
                  _id: booked._id,
                }
              }
            },
            {
              $set: {
                "bookings.$.status": "checkedOut",
              },
            }
          );

          return res.status(200).json({ status: "successful"});
        } else {
          return res.status(500).json({ status: "unsuccessful"});
        }
      } 
      else if (booked.type === "sportComplex") {
        const findCurrent = await SportComplex.findOne(
          {
            _id: venueId,
            subCategory: {
              $elemMatch: {
                _id: subCategoryId,
                currentUser: req.authStudentId
              }
            }
          },
        );
        if (findCurrent){
          await SportComplex.findOneAndUpdate(
            {
              _id: venueId,
              subCategory: {
                $elemMatch: {
                  _id: subCategoryId,
                  currentUser: req.authStudentId
                }
              }
            },
            {
              $set: {
                "subCategory.$.currentUser": null,
              },
            }
          );

          await Student.findOneAndUpdate(
            {
              studentId,
              bookings: {
                $elemMatch: {
                  _id: booked._id,
                }
              }
            },
            {
              $set: {
                "bookings.$.status": "checkedOut",
              },
            }
          );

          return res.status(200).json({ status: "successful"});
        } else {
          return res.status(500).json({ status: "unsuccessful"});
        }
      } else {
        return res.status(500).json({ status: "unsuccessful" });
      }
    } catch (err){
      console.log(err)
      return res.status(500).json({ status: "unsuccessful" });
    }
  }
};
