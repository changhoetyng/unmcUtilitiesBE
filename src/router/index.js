const router = require("express").Router();
const test = require("./Test")
const announcement = require("./Announcement")
const authentication = require("./Authentication")

router.use("/test",test);
router.use("/announcement",announcement)
router.use("/authentication", authentication)

module.exports = router;