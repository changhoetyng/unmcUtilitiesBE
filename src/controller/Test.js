const {createTestName} = require("../service/Test");
const Post = require("../model/Post");

module.exports = {
    postTest: (req,res) => {
        const body = req.body;
        if(body.name === undefined) {
            return res.status(500).json({
                message: "enter name pls"
            })
        }
        createTestName(body, (err, results) => {
            if(err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: results
            })
        })
    },

    mongoGetTest: async (req, res) => {
        try {
          const posts = await Post.find();
          res.json(posts);
        } catch (err) {
          res.json({ message: err });
        }
      }
}