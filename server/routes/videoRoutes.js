const express = require('express');
const router = express.Router();
const {
  getVideosByCourse,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  markVideoWatched,
  uploadVideoFile
} = require('../controllers/videoController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadVideo } = require('../middleware/uploadMiddleware');
const fs = require('fs');
const path = require('path');

// Ensure upload folder exists (important for Render)
const uploadDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ---------------- PUBLIC ROUTES ---------------- //
// Get all videos by course (protected)
router.route('/course/:courseId').get(protect, getVideosByCourse);

// Get single video by ID
router.route('/:id').get(protect, getVideoById);

// Mark video as watched
router.route('/:id/watch').post(protect, markVideoWatched);

// ---------------- ADMIN ROUTES ---------------- //
// Create a video with file upload
router.route('/')
  .post(protect, admin, uploadVideo.single('file'), createVideo);

// Update / Delete a video
router.route('/:id')
  .put(protect, admin, updateVideo)
  .delete(protect, admin, deleteVideo);

// Upload video only (file upload route)
router.route('/upload')
  .post(protect, admin, uploadVideo.single('file'), uploadVideoFile);

// Export router
module.exports = router;
