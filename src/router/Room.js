const router = require("express").Router();
const {isAdmin,requireAuth} = require("../middleware/authMiddleware")
const {addRoom,getRoom,openDate,getDate,deleteRoom,closeTime,openTime,booked,cancelBooking,addSubCategory} = require("../controller/Room")

router.post("/addRoom", isAdmin, addRoom)
router.get("/getRoom", requireAuth, getRoom)
router.post("/openDate", requireAuth, openDate)
router.get("/getDate", requireAuth, getDate)
router.delete("/deleteRoom", requireAuth, deleteRoom)
router.patch("/closeTime", requireAuth, closeTime)
router.patch("/openTime", requireAuth, openTime)
router.patch("/booked", requireAuth, booked)
router.patch("/cancelBooking", requireAuth, cancelBooking)
router.patch("/addSub", isAdmin, addSubCategory)

module.exports = router