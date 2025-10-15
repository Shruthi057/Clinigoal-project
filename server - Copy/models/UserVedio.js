// models/UserVideo.js
import mongoose from "mongoose";

const userVideoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  progress: {
    type: Number, // percentage watched (0-100)
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  },
  watchTime: {
    type: Number, // total seconds watched
    default: 0
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only have one entry per video
userVideoSchema.index({ user: 1, video: 1 }, { unique: true });

export default mongoose.model("UserVideo", userVideoSchema);