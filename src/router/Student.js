const router = require("express").Router();
const {signup,loginUser,authSuccess,checkin,verifyRefreshToken,getFacilityName,getRoomName,showSelectedFacility,showSelectedRoom,getBooked,getPast,checkInEnabled} = require("../controller/Student");
const {getAnnouncement} = require("../controller/Announcement")
const {StudentAuth} = require("../middleware/studentMiddleware")

// AUTH
router.post("/signup",signup)
router.post("/login",loginUser)
router.get("/verifyUser",StudentAuth,authSuccess)
router.get("/token",verifyRefreshToken)

// Sport Complex
router.get("/getFacilityName", StudentAuth, getFacilityName)
router.get("/showSelectedFacility/:facilityId", StudentAuth, showSelectedFacility)
router.get("/showSelectedRoom/:roomId", StudentAuth, showSelectedRoom)

// Rooms
router.get("/getRoomName", StudentAuth, getRoomName)

// Bookings
router.post("/addBookingHistory")
router.get("/getBooked",StudentAuth,getBooked)
router.get("/getPast",StudentAuth,getPast)
router.get("/checkInEnabled/:bookedId",StudentAuth, checkInEnabled)
router.post("/checkin",StudentAuth,checkin)
router.post("/checkout")

//Announcment
router.get("/getAnnouncement", StudentAuth, getAnnouncement)

module.exports = router;