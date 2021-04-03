const router = require("express").Router();
const {loginUser, verifyRefreshToken, authSuccess,changePassword} = require("../controller/Authentication")
const {checkAdmin} = require("../defaultCheck/checkAdmin")
const {isAdmin,requireAuth} = require("../middleware/authMiddleware")


router.post("/loginUser", loginUser)
router.get("/verifyUser",requireAuth,authSuccess)
router.get("/token", verifyRefreshToken)
router.patch("/changePassword",requireAuth, changePassword)
router.post("/postDefault", checkAdmin)

module.exports = router