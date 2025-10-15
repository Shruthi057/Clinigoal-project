const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true,
    trim: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  studentProgress: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure one review per student per course
reviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);