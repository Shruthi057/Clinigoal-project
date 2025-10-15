const express = require('express');
const router = express.Router();
const {
  getVideosByCourse,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  markVideoWatched,
  uploadVideoFile // New controller function
} = require('../controllers/videoController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadVideo } = require('../middleware/uploadMiddleware');

// Public routes (but still protected by auth middleware)
router.route('/course/:courseId').get(protect, getVideosByCourse);
router.route('/:id').get(protect, getVideoById);
router.route('/:id/watch').post(protect, markVideoWatched);

// Admin routes - UPDATED with file upload
router.route('/')
  .post(protect, admin, uploadVideo.single('file'), createVideo);

router.route('/:id')
  .put(protect, admin, updateVideo)
  .delete(protect, admin, deleteVideo);

// New route for file upload only
router.route('/upload')
  .post(protect, admin, uploadVideo.single('file'), uploadVideoFile);

module.exports = router;