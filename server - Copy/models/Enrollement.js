// models/Enrollment.js
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number, // overall course progress (0-100)
    default: 0
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only enroll once in a course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);