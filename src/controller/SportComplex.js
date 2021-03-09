const SportComplex = require("../model/SportComplex");
const SportComplexBooking = require("../model/SportComplexBooking");
const Student = require("../model/Student");
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
    const {
      facilityId,
      date,
      time,
      studentId,
      subCategoryId,
      venueName,
      subCategoryName,
    } = req.body;
    //If body missing
    if (!time || !facilityId || !subCategoryId || !date) {
      return res
        .status(404)
        .json({ status: "unsuccessful", message: "Insufficient information to process" });
    }

    if (mode === "booked" && (!studentId || !venueName || !subCategoryName)) {
      return res
        .status(404)
        .json({ status: "unsuccessful", message: "Insufficient information to booked" });
    }
    
    // If no student exists
    const student = await Student.findOne({ studentId });
    if(!student) {
      return res.status(400).json({ error: "Invalid Student ID" });
    }

    const getDate = await SportComplexBooking.findOne({
      facilityId,
      date,
      subCategoryId,
    });

    if (getDate) {
      const getStatus = getDate.timeListing.find((v) => v.time === time)
        .timeStatus.status;
      if (mode === getStatus) {
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
            const student = await Student.findOneAndUpdate(
              { studentId },
              {
                $push: {
                  bookings: {
                    venueName,
                    type: "sportComplex",
                    subCategoryName,
                    subCategoryId,
                    venueId: facilityId,
                    status: "booked",
                    bookingTime: time,
                    bookingDate: date
                  },
                },
              }
            );

            getDate.timeListing.find(
              (v) => v.time === time
            ).timeStatus.status = mode;
            getDate.timeListing.find(
              (v) => v.time === time
            ).timeStatus.studentId = studentId;
            getDate.timeListing.find(
              (v) => v.time === time
            ).timeStatus.bookingId = student._id;
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

      await SportComplexBooking.findOneAndUpdate(
        { facilityId, date, subCategoryId },
        { timeListing: getDate.timeListing }
      );
      const afterUpdate = await SportComplexBooking.findOne({
        facilityId,
        date,
        subCategoryId,
      });
      return res.status(201).json({ status: "successful", data: afterUpdate });
    } else {
      return res
        .status(404)
        .json({ status: "unsuccessful", message: "facility not found" });
    }
  } catch (err) {
    return res.status(400).json({ status: "unsuccessful", err });
  }
};

module.exports = {
  addFacility: async (req, res) => {
    const { name } = req.body;
    if (name) {
      try {
        const addFacility = await SportComplex.create({
          name,
          currentUser: null,
          subCategory: null,
        });
        return res.status(201).json(addFacility);
      } catch (err) {
        const errors = handleMongoErrors(err);
        console.log(err);
        return res.status(400).json({ errors });
      }
    } else {
      return res.status(500).json({
        status: "unsuccessful",
        message: "name is empty",
      });
    }
  },
  getFacility: async (req, res) => {
    const getFacility = await SportComplex.find({});
    if (getFacility) {
      var facility = [];
      for (const v of getFacility) {
        const facilityData = await SportComplexBooking.find({
          facilityId: v._id,
        });
        facility.push({
          facilityId: v._id,
          facility: v.name,
          subCategory: v.subCategory,
          data: facilityData,
        });
      }
      return res.status(200).json({ data: facility });
    } else {
      return res.status(404).json({ status: "unsuccessful" });
    }
  },
  openDate: async (req, res) => {
    try {
      const { facilityId, date, subCategoryId } = req.body;
      const facilityCheck = await SportComplexBooking.findOne({
        facilityId,
        date: moment(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
        subCategoryId,
      });

      if (facilityCheck) {
        return res
          .status(400)
          .json({ status: "unsuccessful", message: "time already exists" });
      }
      const getFacility = await SportComplex.findOne({ _id: facilityId });
      const getSubCat = getFacility.subCategory.find(
        (v) => String(v._id) === subCategoryId
      );
      if (!getFacility) {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "no facility found" });
      }

      if (!getSubCat) {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "no subcategory found" });
      }

      if (getFacility && date && getSubCat) {
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

        const createBooking = await SportComplexBooking.create({
          facilityId: facilityId,
          subCategoryId: subCategoryId,
          date: moment(date, "DD/MM/YYYY").format("DD/MM/YYYY"),
          timeListing: hours,
        });
        return res.status(201).json({ status: "successful", createBooking });
      } else {
        return res.status(404).json({
          status: "unsuccessful",
          message: "Incorrect facility Id or empty date",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({ status: "unsuccessful", err });
    }
  },
  getDate: async (req, res) => {
    try {
      const { facilityId } = req.query;
      const getFacility = await SportComplexBooking.find({ facilityId });
      if (getFacility) {
        return res
          .status(200)
          .json({ status: "successful", data: getFacility });
      } else {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "facility not found" });
      }
    } catch (err) {
      return res.status(400).json({ status: "unsuccessful", err });
    }
  },
  deleteFacility: async (req, res) => {
    try {
      const { facilityId } = req.body;
      const getFacility = await SportComplex.findOne({ _id: facilityId });
      if (getFacility) {
        await SportComplex.deleteOne({ _id: facilityId });
        await SportComplexBooking.deleteMany({ facilityId: facilityId });
        return res.status(204).json({ status: "successful" });
      } else {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "facility not found" });
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
  addSubCategory: async (req, res) => {
    const { facilityId, subCategory } = req.body;
    if (!subCategory) {
      return res
        .status(400)
        .json({ status: "unsuccessful", message: "empty subcategory" });
    }
    try {
      const getFacility = await SportComplex.findOne({ _id: facilityId });
      if (getFacility) {
        if (getFacility.subCategory) {
          getFacility.subCategory.push({ subName: subCategory });
        } else {
          getFacility.subCategory = [{ subName: subCategory }];
        }

        await SportComplex.findOneAndUpdate(
          {
            _id: facilityId,
          },
          {
            subCategory: getFacility.subCategory,
          }
        );
        const afterUpdate = await SportComplex.findOne({
          _id: facilityId,
        });
        return res
          .status(201)
          .json({ status: "successful", data: afterUpdate });
      } else {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "facility not found" });
      }
    } catch (err) {
      console.log(err);
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
  deleteSubCategory: async (req, res) => {
    const { facilityId, subCategoryId } = req.body;
    if (!subCategoryId) {
      return res
        .status(400)
        .json({ status: "unsuccessful", message: "empty subcategory id" });
    }
    try {
      const getFacility = await SportComplex.findOne({ _id: facilityId });
      if (getFacility) {
        const indexRemove = getFacility.subCategory.findIndex(
          (v) => String(v._id) === subCategoryId
        );

        if (indexRemove < 0) {
          return res
            .status(404)
            .json({ status: "unsuccessful", message: "subcategory not found" });
        }

        await SportComplexBooking.deleteMany({
          facilityId: facilityId,
          subCategoryId: subCategoryId,
        });

        getFacility.subCategory.splice(indexRemove, 1);

        await SportComplex.findOneAndUpdate(
          {
            _id: facilityId,
          },
          {
            subCategory: getFacility.subCategory,
          }
        );
        const afterUpdate = await SportComplex.findOne({
          _id: facilityId,
        });

        return res
          .status(201)
          .json({ status: "successful", data: afterUpdate });
      } else {
        return res
          .status(404)
          .json({ status: "unsuccessful", message: "facility not found" });
      }
    } catch (err) {
      console.log(err);
      const errors = handleMongoErrors(err);
      return res.status(400).json({ errors });
    }
  },
};
