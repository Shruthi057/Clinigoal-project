// controllers/userController.js
const Course = require('../models/Course');
const Video = require('../models/Video');
const UserVideo = require('../models/UserVideo');
const Enrollment = require('../models/Enrollment');

exports.getUserDashboardVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get all enrollments for the user
    const enrollments = await Enrollment.find({ user: userId }).populate('course');
    
    // 2. For each enrollment, get the course and its modules and videos
    const coursesWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        
        // Populate the modules and their videos
        await course.populate({
          path: 'modules.videos',
          model: 'Video'
        });
        
        // Flatten all videos in the course
        const allVideos = [];
        course.modules.forEach(module => {
          module.videos.forEach(video => {
            allVideos.push({
              ...video.toObject(),
              moduleTitle: module.title,
              moduleId: module._id
            });
          });
        });
        
        // 3. Get user's progress data for these videos
        const videoIds = allVideos.map(v => v._id);
        const userVideos = await UserVideo.find({ 
          user: userId,
          video: { $in: videoIds }
        });
        
        // 4. Combine video data with user progress
        const videosWithProgress = allVideos.map(video => {
          const userVideo = userVideos.find(uv => uv.video.toString() === video._id.toString());
          return {
            ...video,
            progress: userVideo ? userVideo.progress : 0,
            completed: userVideo ? userVideo.completed : false,
            lastWatched: userVideo ? userVideo.lastWatched : null
          };
        });
        
        return {
          ...course.toObject(),
          enrollmentProgress: enrollment.progress,
          enrollmentCompleted: enrollment.completed,
          videos: videosWithProgress
        };
      })
    );
    
    res.status(200).json({
      success: true,
      courses: coursesWithDetails
    });
    
  } catch (error) {
    console.error("Error fetching user dashboard videos:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};