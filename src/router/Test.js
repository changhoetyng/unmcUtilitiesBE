const router = require("express").Router();
const { postTest, mongoGetTest } = require("../controller/Test");
const Post = require("../model/Post");

router.post("/", postTest);

router.get("/mongoGetTest", mongoGetTest);

router.post("/mongoTest", async (req, res) => {
  const post = new Post({
    title: req.body.title,
  });

  try {
    const savePost = await post.save();
    res.status(200).json(savePost);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/mongoGetTitle", async (req,res) => {
    try {
        const posts = await Post.find({title: req.query.title})
        res.json(posts)
    } catch (err) {
        res.json({ message: err });
    }
})

module.exports = router;
