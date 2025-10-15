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
  completedAt: {
    type: Date
  },
  progress: {
    type: Number, // overall course progress (0-100)
    default: 0,
    min: 0,
    max: 100
  },
  
  // Detailed progress tracking
  currentModule: {
    type: Number,
    default: 0
  },
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  totalModules: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  
  // Lesson completion tracking
  completedLessons: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    },
    videoWatched: {
      type: Boolean,
      default: false
    },
    resourcesDownloaded: [{
      resourceId: String,
      downloadedAt: Date
    }]
  }],
  
  // Module completion tracking
  completedModules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId
    },
    moduleNumber: Number,
    completedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  
  // Quiz and assessment tracking
  quizAttempts: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    score: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOption: String,
      isCorrect: Boolean,
      timeSpent: Number // seconds
    }]
  }],
  
  // Assignment tracking
  assignmentSubmissions: [{
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resubmitted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Time tracking and activity
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  },
  
  // Certificate information
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    certificateId: String,
    issuedAt: Date,
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloaded: Date
  },
  
  // Payment and enrollment details
  enrollmentType: {
    type: String,
    enum: ['free', 'paid', 'trial', 'scholarship'],
    default: 'paid'
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentId: String,
  
  // Status and flags
  status: {
    type: String,
    enum: ['active', 'paused', 'dropped', 'completed', 'expired'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  droppedAt: Date,
  expiryDate: Date,
  
  // Notes and personal tracking
  personalNotes: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  }],
  
  // Bookmarks
  bookmarks: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    moduleId: mongoose.Schema.Types.ObjectId,
    timestamp: Number, // for video bookmarks
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]

}, {
  timestamps: true
});

// Create a compound index to ensure a user can only enroll once in a course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Indexes for better performance
enrollmentSchema.index({ user: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ completed: 1 });
enrollmentSchema.index({ progress: 1 });
enrollmentSchema.index({ lastAccessed: -1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Virtual for completion status
enrollmentSchema.virtual('completionStatus').get(function() {
  if (this.completed) return 'completed';
  if (this.progress >= 80) return 'almost_completed';
  if (this.progress >= 50) return 'halfway';
  if (this.progress >= 25) return 'started';
  return 'just_enrolled';
});

// Virtual for time since enrollment
enrollmentSchema.virtual('daysSinceEnrollment').get(function() {
  const now = new Date();
  const enrolled = new Date(this.enrolledAt);
  const diffTime = Math.abs(now - enrolled);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for estimated completion time
enrollmentSchema.virtual('estimatedCompletionTime').get(function() {
  if (this.progress === 0) return null;
  const daysSinceEnroll = this.daysSinceEnrollment;
  const estimatedTotalDays = (daysSinceEnroll / this.progress) * 100;
  return Math.ceil(estimatedTotalDays);
});

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  // Update completed status if progress reaches 100%
  if (this.progress >= 100 && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
    this.status = 'completed';
    
    // Issue certificate if not already issued
    if (!this.certificate.issued) {
      this.certificate.issued = true;
      this.certificate.issuedAt = new Date();
      this.certificate.certificateId = `CERT-${this._id.toString().slice(-12)}-${Date.now().toString().slice(-6)}`;
    }
  }
  
  // Update last accessed timestamp
  this.lastAccessed = new Date();
  
  next();
});

// Static methods
enrollmentSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate('course', 'title instructor thumbnail duration level category')
    .sort({ lastAccessed: -1 });
};

enrollmentSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId })
    .populate('user', 'name email profile.avatar')
    .sort({ progress: -1 });
};

enrollmentSchema.statics.findActiveEnrollments = function(userId) {
  return this.find({ 
    user: userId, 
    status: 'active',
    isActive: true 
  }).populate('course');
};

enrollmentSchema.statics.findCompletedEnrollments = function(userId) {
  return this.find({ 
    user: userId, 
    completed: true 
  }).populate('course');
};

enrollmentSchema.statics.getCourseEnrollmentStats = function(courseId) {
  return this.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$course',
        totalEnrollments: { $sum: 1 },
        completedEnrollments: { 
          $sum: { $cond: ['$completed', 1, 0] } 
        },
        averageProgress: { $avg: '$progress' },
        averageTimeSpent: { $avg: '$totalTimeSpent' },
        activeEnrollments: {
          $sum: { 
            $cond: [
              { $and: ['$isActive', { $eq: ['$status', 'active'] }] }, 
              1, 0 
            ] 
          }
        }
      }
    }
  ]);
};

// Instance methods
enrollmentSchema.methods.updateProgress = function(progress, currentModule = 0, currentLesson = null) {
  this.progress = Math.min(100, Math.max(0, progress));
  this.currentModule = currentModule;
  this.currentLesson = currentLesson;
  
  return this.save();
};

enrollmentSchema.methods.markLessonCompleted = function(lessonId, timeSpent = 0, videoWatched = false) {
  // Check if lesson already completed
  const existingIndex = this.completedLessons.findIndex(
    lesson => lesson.lessonId.toString() === lessonId.toString()
  );
  
  if (existingIndex === -1) {
    this.completedLessons.push({
      lessonId,
      timeSpent,
      videoWatched,
      completedAt: new Date()
    });
  } else {
    // Update existing completion
    this.completedLessons[existingIndex].timeSpent += timeSpent;
    this.completedLessons[existingIndex].videoWatched = videoWatched;
    this.completedLessons[existingIndex].completedAt = new Date();
  }
  
  this.totalTimeSpent += timeSpent;
  this.accessCount += 1;
  
  return this.save();
};

enrollmentSchema.methods.markModuleCompleted = function(moduleId, moduleNumber) {
  const existingIndex = this.completedModules.findIndex(
    module => module.moduleId.toString() === moduleId.toString()
  );
  
  if (existingIndex === -1) {
    this.completedModules.push({
      moduleId,
      moduleNumber,
      progress: 100,
      completedAt: new Date()
    });
  }
  
  return this.save();
};

enrollmentSchema.methods.addQuizAttempt = function(quizData) {
  this.quizAttempts.push({
    quizId: quizData.quizId,
    score: quizData.score,
    totalQuestions: quizData.totalQuestions,
    percentage: quizData.percentage,
    passed: quizData.passed || quizData.percentage >= 70,
    timeSpent: quizData.timeSpent || 0,
    answers: quizData.answers || [],
    attemptedAt: new Date()
  });
  
  this.totalTimeSpent += quizData.timeSpent || 0;
  this.accessCount += 1;
  
  return this.save();
};

enrollmentSchema.methods.addAssignmentSubmission = function(assignmentData) {
  this.assignmentSubmissions.push({
    assignmentId: assignmentData.assignmentId,
    submittedAt: new Date(),
    grade: assignmentData.grade,
    feedback: assignmentData.feedback
  });
  
  return this.save();
};

enrollmentSchema.methods.addBookmark = function(bookmarkData) {
  this.bookmarks.push({
    lessonId: bookmarkData.lessonId,
    moduleId: bookmarkData.moduleId,
    timestamp: bookmarkData.timestamp,
    note: bookmarkData.note,
    createdAt: new Date()
  });
  
  return this.save();
};

enrollmentSchema.methods.addPersonalNote = function(noteData) {
  this.personalNotes.push({
    lessonId: noteData.lessonId,
    note: noteData.note,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return this.save();
};

enrollmentSchema.methods.trackAccess = function() {
  this.lastAccessed = new Date();
  this.accessCount += 1;
  return this.save();
};

enrollmentSchema.methods.calculateProgress = function(totalLessons, totalModules) {
  const completedLessonsCount = this.completedLessons.length;
  this.progress = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
  
  // Update module progress
  this.completedModules.forEach(module => {
    module.progress = 100; // Simplified - you might want more detailed module progress
  });
  
  return this.save();
};

enrollmentSchema.methods.getQuizStats = function() {
  const totalQuizzes = this.quizAttempts.length;
  const passedQuizzes = this.quizAttempts.filter(quiz => quiz.passed).length;
  const averageScore = totalQuizzes > 0 
    ? this.quizAttempts.reduce((sum, quiz) => sum + quiz.percentage, 0) / totalQuizzes 
    : 0;
  
  return {
    totalQuizzes,
    passedQuizzes,
    failedQuizzes: totalQuizzes - passedQuizzes,
    passRate: totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0,
    averageScore: Math.round(averageScore * 10) / 10
  };
};

enrollmentSchema.methods.getTimeStats = function() {
  const totalHours = this.totalTimeSpent / 60;
  const averagePerSession = this.accessCount > 0 ? totalHours / this.accessCount : 0;
  
  return {
    totalHours: Math.round(totalHours * 10) / 10,
    totalMinutes: this.totalTimeSpent,
    averageSessionHours: Math.round(averagePerSession * 10) / 10,
    accessCount: this.accessCount
  };
};

enrollmentSchema.methods.isCertificateEligible = function(courseRequirements) {
  if (!courseRequirements) return false;
  
  let eligible = true;
  
  // Check completion requirement
  if (courseRequirements.completeAllLessons && this.progress < 100) {
    eligible = false;
  }
  
  // Check quiz requirements
  if (courseRequirements.passAllQuizzes) {
    const failedQuizzes = this.quizAttempts.filter(quiz => !quiz.passed);
    if (failedQuizzes.length > 0) {
      eligible = false;
    }
  }
  
  // Check final exam requirement
  if (courseRequirements.passFinalExam && courseRequirements.minimumGrade) {
    const finalExam = this.quizAttempts.find(quiz => 
      quiz.quizId.toString() === courseRequirements.finalExamId?.toString()
    );
    
    if (!finalExam || finalExam.percentage < courseRequirements.minimumGrade) {
      eligible = false;
    }
  }
  
  return eligible;
};

// Query helpers
enrollmentSchema.query.byStatus = function(status) {
  return this.where({ status });
};

enrollmentSchema.query.byProgressRange = function(min, max) {
  return this.where({ progress: { $gte: min, $lte: max } });
};

enrollmentSchema.query.recentlyAccessed = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where({ lastAccessed: { $gte: date } });
};

enrollmentSchema.query.withDetails = function() {
  return this.populate('user', 'name email profile.avatar')
            .populate('course', 'title instructor thumbnail duration level category averageRating');
};

export default mongoose.model("Enrollment", enrollmentSchema);