const router = require("express").Router();
const {isAdmin,requireAuth} = require("../middleware/authMiddleware")
const {StudentAuth} = require("../middleware/studentMiddleware")
const {addFacility,getFacility,openDate,getDate,deleteFacility,closeTime,openTime,booked,cancelBooking,addSubCategory,deleteSubCategory} = require("../controller/SportComplex")

router.post("/addFacility", isAdmin, addFacility)
router.get("/getFacility", requireAuth, getFacility)
router.post("/openDate", requireAuth, openDate)
router.get("/getDate", requireAuth, getDate)
router.delete("/deleteFacility", isAdmin, deleteFacility)
router.patch("/closeTime", requireAuth, closeTime)
router.patch("/openTime", requireAuth, openTime)
router.patch("/booked", StudentAuth, booked)
router.patch("/cancelBooking", requireAuth, cancelBooking)
router.patch("/addSub", isAdmin, addSubCategory)
router.patch("/deleteSub",isAdmin, deleteSubCategory)

module.exports = router