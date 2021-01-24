const Room = require("../model/Room");
const RoomBooking = require("../model/RoomBooking");
const moment = require("moment");

const handleMongoErrors = (err) => {
  let errors = {};

  if (err.code === 11000) {
    Object.entries(err.keyPattern).map(([key]) => {
      errors[key] = "Duplicated";
    });
  } else {
    return err;
  }
  return errors;
};

const timeHandler = async (req, res, mode) => {
  try {
    const { roomId, date, time, studentId } = req.body;
    //err handler
    if (!time) {
      return res
        .status(404)
        .json({ status: "unsuccessful", message: "time is empty" });
    }

    if (mode === "booked" && !studentId) {
      return res
        .status(404)
        .json({ status: "unsuccessful", message: "studentId is empty" });
    }

    const getDate = await RoomBooking.findOne({ roomId, date });
    if (getDate) {
      const getStatus = getDate.timeListing.find((v) => v.time === time)
        .timeStatus.status;
      if(mode === getStatus){
        return res
            .status(400)
            .json({ status: "unsuccessful", message: `time is already ${mode}` }); 
      }

      //For closing and opening booking
      if (mode === "close" || mode === "open") {
        if (getStatus !== "booked") {
          getDate.timeListing.find(
            (v) => v.time === time
          ).timeStatus.status = mode;
        } else {
          return res
            .status(400)
            .json({ status: "unsuccessful", message: "time is booked" });
        }
      }

      //For booking mode
      if (mode === "booked") {
        if (getStatus !== "close" && getStatus !== "booked") {
          getDate.timeListing.find(
            (v) => v.time === time
          ).timeStatus.status = mode;
          getDate.timeListing.find(
            (v) => v.time === time
          ).timeStatus.studentId = studentId;
        } else {
          return res
            .status(400)
            .json({ status: "unsuccessful", message: "time can't be booked" });
        }
      }

      //For cancel booking
      if (mode === "cancelBooking") {
        if (getStatus === "booked") {
          getDate.timeListing.find((v) => v.time === time).timeStatus.status =
            "close";
          getDate.timeListing.find(
            (v) => v.time === time
          ).timeStatus.studentId = null;
        } else {
          return res
            .status(400)
            .json({ status: "unsuccessful", message: "time is not booked" });
        }
      }

      await RoomBooking.findOneAndUpdate(
        { roomId, date },
        { timeListing: getDate.timeListing }
      );
      const afterUpdate = await RoomBooking.findOne({
        roomId,
        date,
      });
      return res.status(201).json({ status: "successful", data: afterUpdate });
    } else {
      return res
        .status(404)
        .json({ status: "unsuccessful", message: "room not found" });
    }
  } catch (err) {
    return res.status(400).json({ status: "unsuccessful", err });
  }
};

module.exports = {
  addRoom: async (req, res) => {
    const { name } = req.body;
    if (name) {
      try {
        const addRoom = await Room.create({
          name,
        });
        return res.status(201).json(addRoom);
      } catch (err) {
        const errors = handleMongoErrors(err);
        return res.status(400).json({ errors });
      }
    } else {
      return res.status(500).json({
        status: "unsuccessful",
        message: "name is empty",
      });
    }
  },
  getRoom: async (req, res) => {
    const getRoom = await Room.find({});
    if (getRoom) {
      return res.status(200).json({ data: getRoom });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
  openDate: async (req, res) => {
    try {
      const { _id, date } = req.body;

      const roomCheck = await RoomBooking.findOne({  date: moment(date, "DD/MM/YYYY").format("DD/MM/YYYY") });

      if(roomCheck){
        return res.status(400).json({ status: "time already exists"});
      }

      const getRoom = await Room.findOne({ _id });
      
      if (getRoom && date) {
        const hours = Array.from(
          {
            length: 24,
          },
          (_, hour) => {
            return {
              time: moment({ hour: hour, minutes: 00 }).format("HH:mm"),
              timeStatus: {
                status: "close",
                studentId: null,
              },
            };
          }
        );

        const createBooking = await RoomBooking.create({
          roomId: _id,
          date: moment(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
          timeListing: hours,
        });
        return res.status(201).json({ status: "successful", createBooking });
      } else {
        return res
          .status(404)
          .json({
            status: "unsuccessful",
            message: "Incorrect room Id or empty date",
          });
      }
    } catch (err) {
      return res.status(400).json({ status: "unsuccessful", err });
    }
  },
  getDate: async (req, res) => {
    try {
      const { roomId } = req.query;
      const getRoom = await RoomBooking.find({ roomId });
      if (getRoom) {
        return res
          .status(200)
          .json({ status: "successful", data: getRoom });
      } else {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "room not found" });
      }
    } catch (err) {
      return res.status(400).json({ status: "unsuccessful", err });
    }
  },
  deleteRoom: async (req, res) => {
    try {
      const { roomId } = req.body;
      const getRoom = await Room.findOne({ _id: roomId });
      if (getRoom) {
        await Room.deleteOne({ _id: roomId });
        await RoomBooking.deleteMany({ roomId: roomId });
        return res.status(204).json({ status: "successful" });
      } else {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "room not found" });
      }
    } catch (err) {
      return res.status(400).json({ status: "unsuccessful", err });
    }
  },
  closeTime: async (req, res) => {
    return timeHandler(req, res, "close");
  },
  openTime: async (req, res) => {
    return timeHandler(req, res, "open");
  },
  booked: async (req, res) => {
    return timeHandler(req, res, "booked");
  },
  cancelBooking: async (req, res) => {
    return timeHandler(req, res, "cancelBooking");
  },
};
