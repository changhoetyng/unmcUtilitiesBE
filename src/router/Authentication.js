const router = require("express").Router();
const {createUser, loginUser} = require("../controller/Authentication")

router.post("/createUser",createUser)
router.post("/loginUser", loginUser)

module.exports = router