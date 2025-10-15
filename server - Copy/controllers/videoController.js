const Video = require('../models/Video');
const Course = require('../models/Course');
const UserVideo = require('../models/UserVideo');
const Enrollment = require('../models/Enrollment');
const path = require('path');
const fs = require('fs');

// @desc    Create a new video with file upload
// @route   POST /api/videos
// @access  Private/Admin
exports.createVideo = async (req, res) => {
  try {
    console.log('📹 Creating video with data:', req.body);
    console.log('📁 File received:', req.file);

    const { title, description, course, module, duration } = req.body;
    
    // Validate required fields
    if (!title || !course) {
      // If there's a uploaded file, delete it since validation failed
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: 'Title and course are required fields' 
      });
    }

    // Build video URL from uploaded file
    let videoUrl = '';
    if (req.file) {
      videoUrl = `/uploads/videos/${req.file.filename}`;
    } else if (req.body.url) {
      videoUrl = req.body.url; // Use provided URL if no file uploaded
    } else {
      return res.status(400).json({ 
        message: 'Either a video file or URL is required' 
      });
    }

    // Create new video
    const video = new Video({
      title,
      description: description || '',
      url: videoUrl,
      course,
      module: module || null,
      duration: duration ? parseInt(duration) : 0,
      thumbnail: req.body.thumbnail || '',
      order: req.body.order || 0
    });

    const savedVideo = await video.save();
    
    // If module is specified, update course module
    if (module) {
      await Course.findByIdAndUpdate(
        course,
        { 
          $push: { 
            'modules.$[elem].videos': savedVideo._id 
          } 
        },
        { 
          arrayFilters: [{ 'elem._id': module }],
          new: true
        }
      );
    }

    console.log('✅ Video created successfully:', savedVideo._id);
    res.status(201).json({
      message: 'Video created successfully',
      video: savedVideo
    });
  } catch (error) {
    console.error('❌ Error creating video:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Handle video file upload only
// @route   POST /api/videos/upload
// @access  Private/Admin
exports.uploadVideoFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Video file uploaded successfully',
      url: videoUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading video file:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error uploading video file', 
      error: error.message 
    });
  }
};

// @desc    Update a video (with optional file upload)
// @route   PUT /api/videos/:id
// @access  Private/Admin
exports.updateVideo = async (req, res) => {
  try {
    const { title, description, course, module, duration, thumbnail, order } = req.body;
    
    const updateData = {
      title,
      description,
      course,
      module,
      duration,
      thumbnail,
      order
    };

    // If a new file is uploaded, update the URL
    if (req.file) {
      updateData.url = `/uploads/videos/${req.file.filename}`;
      
      // Optionally delete the old file
      const oldVideo = await Video.findById(req.params.id);
      if (oldVideo && oldVideo.url && oldVideo.url.startsWith('/uploads/videos/')) {
        const oldFilePath = path.join(__dirname, '..', oldVideo.url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!video) {
      // Delete the uploaded file if video not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(200).json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Error updating video:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Keep all your existing functions (getVideosByCourse, getVideoById, deleteVideo, markVideoWatched) 
// exactly as they are - they don't need changes

// ... (your existing functions remain the same)