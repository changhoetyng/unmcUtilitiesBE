const router = require("express").Router();
const {isAdmin,requireAuth} = require("../middleware/authMiddleware")
const {getUser,changeUsername,changeEmail,createUser,getAllStaff,deleteUser} = require("../controller/User")

router.post("/createUser",isAdmin,createUser)
router.get("/getAllStaff",isAdmin,getAllStaff)
router.delete("/deleteUser/:id",isAdmin,deleteUser)
router.get("/",requireAuth,getUser)
router.patch("/changeUsername",requireAuth, changeUsername)
router.patch("/changeEmail",requireAuth, changeEmail)

module.exports = router;