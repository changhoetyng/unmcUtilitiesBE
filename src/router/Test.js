const router = require("express").Router();
const {postTest} = require("../controller/Test");

router.post("/",postTest);
module.exports = router