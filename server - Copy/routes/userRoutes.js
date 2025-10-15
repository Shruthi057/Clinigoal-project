// routes/userRoutes.js
const express = require('express');
const { getUserDashboardVideos } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard/videos', protect, getUserDashboardVideos);

module.exports = router;