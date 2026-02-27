const express = require("express");
const {
  register,
  login,
  updateProfileImage,
} = require("../controllers/authController");

const { authenticate } = require("../middleware/authMiddleware");
const upload = require("../utils/fileUpload");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.put(
  "/profile-image",
  authenticate,
  upload.single("profile_image"),
  updateProfileImage,
);

module.exports = router;
