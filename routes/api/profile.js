const express = require("express");
const User = require("../../model/User");
const router = express.Router();
// @route GET api/auth
// @desc Test route
// @access Public
router.get("/", async (req, res) => {
  try {
    user = await User.find();
    res.json(user);
  } catch (errors) {
    res.status(400).json({ errors: [errors.message] });
  }
});

module.exports = router;
