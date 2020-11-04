const router = require("express").Router();
const worm = require("./Test")

router.use("/test",worm);

module.exports = router;