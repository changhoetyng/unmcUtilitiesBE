const router = require("express").Router();
const test = require("./Test")
const announcement = require("./Announcement")
const authentication = require("./Authentication")
const sportComplex = require("./SportComplex")
const room = require("./Room")
const user = require("./User")

router.use("/test",test);
router.use("/announcement",announcement)
router.use("/auth", authentication)
router.use("/user", user)
router.use("/sportComplex", sportComplex)
router.use("/room", room)

module.exports = router;