const router = require("express").Router();
const test = require("./Test")
const announcement = require("./Announcement")
const authentication = require("./Authentication")
const user = require("./User")

router.use("/test",test);
router.use("/announcement",announcement)
router.use("/authentication", authentication)
router.use("/user", user)

module.exports = router;