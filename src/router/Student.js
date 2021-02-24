const router = require("express").Router();
const {signup,loginUser} = require("../controller/Student");


router.post("/signup",signup)
router.post("/login",loginUser)
router.post("/checkin")
router.post("/checkout")

module.exports = router;