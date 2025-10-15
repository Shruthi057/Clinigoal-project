const mongoose = require('mongoose');

const studentActivitySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  activityType: {
    type: String,
    enum: ['login', 'video_watch', 'quiz_attempt', 'note_download', 'lesson_complete', 'course_access'],
    required: true
  },
  moduleId: mongoose.Schema.Types.ObjectId,
  lessonId: mongoose.Schema.Types.ObjectId,
  videoId: mongoose.Schema.Types.ObjectId,
  quizId: mongoose.Schema.Types.ObjectId,
  duration: Number,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentActivity', studentActivitySchema);