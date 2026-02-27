const express = require("express");
const router = express.Router();

const {
  downloadApp,
  getAllApps,
  getAppById,
} = require("../controllers/appController");

const rateLimit = require("express-rate-limit");

const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: "Too many download attempts. Try again later." },
});

const ratingsRoutes = require("./ratingsRoutes");

router.get("/", getAllApps);
router.get("/:id/download", downloadLimiter, downloadApp);
router.get("/:id", getAppById);
router.use("/:id", ratingsRoutes);

module.exports = router;
