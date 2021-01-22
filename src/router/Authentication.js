const router = require("express").Router();
const {loginUser, verifyRefreshToken, authSuccess,changePassword} = require("../controller/Authentication")
const {isAdmin,requireAuth} = require("../middleware/authMiddleware")


router.post("/loginUser", loginUser)
router.get("/verifyUser",requireAuth,authSuccess)
router.get("/token", verifyRefreshToken)
router.patch("/changePassword",requireAuth, changePassword)

module.exports = router