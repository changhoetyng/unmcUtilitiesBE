const router = require("express").Router();
const {postAnnouncement,getAnnouncement, deleteAnnouncement} = require("../controller/Announcement");
const {requireAuth} = require("../middleware/authMiddleware")

router.post("/postAnnouncement",requireAuth, postAnnouncement)
router.get("/getAnnouncement", requireAuth, getAnnouncement)
router.delete("/deleteAnnouncement/:id", requireAuth, deleteAnnouncement)

module.exports = router