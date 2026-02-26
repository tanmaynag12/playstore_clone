const express = require("express");
const router = express.Router();
const { downloadApp } = require("../controllers/appController");

const { getAllApps, getAppById } = require("../controllers/appController");
const ratingsRoutes = require("./ratingsRoutes");

router.get("/", getAllApps);
router.get("/:id/download", downloadApp);
router.get("/:id", getAppById);
router.use("/:id", ratingsRoutes);
module.exports = router;
