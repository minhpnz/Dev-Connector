const { json } = require("express");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../model/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const config = require("config");
// @route POST api/users
// @desc Register user
// @access Public

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exits" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //Return json web token
      const payload = {
        user: {
          id: user.id,
        },
      };
      //JWT sign contain  ( payload, secret , {option} , callback function(error, token) )
      jsonwebtoken.sign(
        payload,
        config.get("jsonSecret"),
        { expiresIn: 36000 },
        (error, token) => {
          if (error) throw error;
          res.json(token);
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
    // See if user exits

    // Get users gravatar

    // Encrypt password

    // Return jsonwebtoken
  }
);

module.exports = router;
