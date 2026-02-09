const express = require('express');
const router = express.Router();
const { getAllApps, getAppById } = require('../controllers/appController');

router.get('/apps', getAllApps);
router.get('/apps/:id', getAppById);

module.exports = router;
