const Announcement = require("../model/Announcement");

module.exports = {
  postAnnouncement: async (req, res) => {
    const body = req.body;
    if (body.title === undefined || body.announcement === undefined) {
      return res.status(500).json({
        message: "title and announcement message cannot be undefined.",
      });
    }
    const announcement = new Announcement({
      title: body.title,
      announcement: body.announcement,
    });
    try {
      const savePost = await announcement.save();
      res.status(200).json(savePost);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },

  getAnnouncement: async (req, res) => {
    try {
      const { limit } = req.query;
      const announcement = await Announcement.find()
        .sort({ date: -1 })
        .limit(parseInt(limit));
      res.status(200).json(announcement);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },

  deleteAnnouncement: async (req, res) => {
    try {
      const { id } = req.params;
      const removeAnnouncement = await Announcement.deleteOne({_id: id})
      res.status(204).json(removeAnnouncement)
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
