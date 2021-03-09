const router = require("express").Router();
const {signup,loginUser,authSuccess,checkin,verifyRefreshToken,getFacilityName,getRoomName,showSelectedFacility,showSelectedRoom} = require("../controller/Student");
const {getAnnouncement} = require("../controller/Announcement")
const {requireAuth} = require("../middleware/studentMiddleware")

// AUTH
router.post("/signup",signup)
router.post("/login",loginUser)
router.get("/verifyUser",requireAuth,authSuccess)
router.get("/token",verifyRefreshToken)

// Sport Complex
router.get("/getFacilityName", requireAuth, getFacilityName)
router.get("/showSelectedFacility/:facilityId", requireAuth, showSelectedFacility)
router.get("/showSelectedRoom/:roomId", requireAuth, showSelectedRoom)

// Rooms
router.get("/getRoomName", requireAuth, getRoomName)

// Bookings
router.post("/addBookingHistory")
router.post("/checkin",requireAuth,checkin)
router.post("/checkout")

//Announcment
router.get("/getAnnouncement", requireAuth, getAnnouncement)

module.exports = router;