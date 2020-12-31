const express = require("express");
const Profile = require("../../model/Profile");
const User = require("../../model/User");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const router = express.Router();
// @route GET api/profile/me
// @desc  Get current user profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("users", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
  } catch (errors) {
    console.error(errors.message);
    res.status(500).send("Server Error");
  }
});
// @route Profile api/profile
// @desc  Get current user profile
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skill is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
      status,
    } = req.body;
    // res.send("Success");
    // Build profile object
    const profileFields = {};
    profileFields.social = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;

    if (status) profileFields.status = status;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
      // res.json(profileFields.skills);
    }
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        console.log("update");
        return res.json(profile);
      }
      profile = new Profile(profileFields);
      await profile.save();
      console.log("created");
      return res.json(profile);
    } catch (errors) {
      res.status(500).json({ errors: errors.message });
    }
  }
);
// @route GET api/profile
// @desc  Get all profile
// @access Private
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("users", ["name", "avatar"]);
    const notcursor = await Profile.find();
    const cursor = await Profile.find().cursor();
    console.log(cursor, " and ", notcursor);
    return res.json(profiles);
  } catch (errros) {
    res.status(500).json({ error: errros.message });
  }
});

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("users", ["name", "avatar"]);

    return res.json(profile);
  } catch (errros) {
    res.status(500).json({ error: errros.message });
  }
});
router.delete("/delete/user/:user_id", async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.params.user_id });
    await User.findOneAndRemove({ _id: req.params.user_id });
    res.json("Remove success");
  } catch (errors) {
    res.status(500).json({ error: errors.message });
  }
});
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "tittle is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      console.log(req.user.id);
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();

      return res.json(profile);
    } catch (errors) {
      res.status(500).json({ errors: errors.message });
    }
  }
);

router.delete("/delete/experience/:exp_index", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_index);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, description } = req.body;
    const newEducation = { school, degree, fieldofstudy, from };
    if (description) newEducation.description = description;
    const profile = await Profile.findOne({ user: req.user.id });
    console.log(profile);

    try {
      profile.education.unshift(newEducation);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      return res.json({ error: error.message });
    }
  }
);
router.delete("/delete/education/:education_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.education_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    return res.json(profile);
  } catch (err) {
    return res.json({ error: err.message });
  }
});
module.exports = router;
