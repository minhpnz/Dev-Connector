const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../model/User");
const Profile = require("../../model/Profile");
const Posts = require("../../model/Posts");
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      const post = new Posts(newPost);
      await post.save();
      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    await post.remove();
    res.send("Post has been removed");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/likes/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const { likes } = post;
    const likesIndex = likes.map((item) => item.user).indexOf(req.user.id);

    if (likesIndex !== -1) {
      return res.status(400).json("Post already likes");
    }
    likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const { likes } = post;
    removeIndex = likes.map((item) => item.user).indexOf(req.user.id);

    if (removeIndex == -1) {
      return res.status(400).json("There is no like");
    }
    post.likes.splice(removeIndex, 1);
    await post.save();
    return res.status(200).json(post);
  } catch (error) {}
});

router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const post = await Posts.findById(req.params.id);
      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.status(200).json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    const removeIndex = post.comments
      .map((item) => item.id)
      .indexOf(req.params.comment_id);
    if (removeIndex == -1) {
      return res.status(400).send("Comment does not exits");
    }
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
