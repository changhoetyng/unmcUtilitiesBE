const router = require("express").Router();
const {isAdmin,requireAuth} = require("../middleware/authMiddleware")
const {addFacility,getFacility,openDate,getDate,deleteFacility,closeTime,openTime,booked,cancelBooking} = require("../controller/SportComplex")

router.post("/addFacility", isAdmin, addFacility)
router.get("/getFacility", requireAuth, getFacility)
router.post("/openDate", requireAuth, openDate)
router.get("/getDate", requireAuth, getDate)
router.delete("/deleteFacility", requireAuth, deleteFacility)
router.patch("/closeTime", requireAuth, closeTime)
router.patch("/openTime", requireAuth, openTime)
router.patch("/booked", requireAuth, booked)
router.patch("/cancelBooking", requireAuth, cancelBooking)

module.exports = router