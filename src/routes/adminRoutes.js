const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");
const {
  createApp,
  deleteApp,
  updateApp,
} = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post(
  "/apps",
  authenticate,
  authorize("admin"),
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "screenshots", maxCount: 5 },
  ]),
  createApp,
);
router.put(
  "/apps/:id",
  authenticate,
  authorize("admin"),
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "screenshots", maxCount: 5 },
  ]),
  updateApp,
);

router.delete("/apps/:id", authenticate, authorize("admin"), deleteApp);

module.exports = router;
