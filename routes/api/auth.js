const express = require("express");

const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../model/User");
const config = require("config");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const { json } = require("express");

// @route GET api/auth
// @desc Test route
// @access Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Password does not match" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jsonwebtoken.sign(
        payload,
        config.get("jsonSecret"),
        { expiresIn: 36000 },
        (error, token) => {
          if (error) throw error;
          res.json(token);
        }
      );
    } catch (errors) {
      return res.status(400).json({ errors: [{ msg: errors.message }] });
    }
  }
);

module.exports = router;
