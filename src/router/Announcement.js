const router = require("express").Router();
const {postAnnouncement,getAnnouncement, deleteAnnouncement} = require("../controller/Announcement");

router.post("/postAnnouncement", postAnnouncement)
router.get("/getAnnouncement", getAnnouncement)
router.delete("/deleteAnnouncement/:id", deleteAnnouncement)

module.exports = router