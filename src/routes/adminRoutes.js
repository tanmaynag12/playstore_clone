const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");
const apiKeyAuth = require("../middleware/apiKeyAuth");
const { createApp, deleteApp } = require("../controllers/adminController");

router.post(
  "/apps",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "screenshots", maxCount: 5 },
  ]),
  apiKeyAuth,
  createApp,
);

router.delete("/apps/:id", apiKeyAuth, deleteApp);

module.exports = router;
