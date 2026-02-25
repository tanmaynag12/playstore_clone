const express = require("express");
const router = express.Router();

const { getAllApps, getAppById } = require("../controllers/appController");
const ratingsRoutes = require("./ratingsRoutes");

router.get("/", getAllApps);
router.get("/:id", getAppById);

router.use("/:id", ratingsRoutes);

module.exports = router;
