const router = require("express").Router();
const test = require("./Test")
const announcement = require("./Announcement")

router.use("/test",test);
router.use("/announcement",announcement)

module.exports = router;