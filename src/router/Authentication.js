const router = require("express").Router();
const {createUser, loginUser} = require("../controller/Authentication")
const {isAdmin,requireAuth} = require("../middleware/authMiddleware")

router.post("/createUser",isAdmin,createUser)
router.post("/loginUser", loginUser)

module.exports = router