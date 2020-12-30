const express = require("express");
const router = express.Router();
// @route GET api/auth
// @desc Test route
// @access Public
router.get("/", (res, req) => {
  res.send("post route");
});

module.exports = router;
