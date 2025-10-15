import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 150
  },
  category: { 
    type: String, 
    enum: ['Clinical Research', 'Bioinformatics', 'Medical Coding', 'Pharmacovigilance', 'Healthcare', 'Medical Writing', 'Clinical Data Management'],
    required: true 
  },
  instructor: { 
    type: String, 
    required: true 
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  thumbnail: { 
    type: String,
    default: ''
  },
  promoVideo: {
    type: String
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // Total course duration in minutes
    default: 0
  },
  totalModules: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  totalQuizzes: {
    type: Number,
    default: 0
  },
  totalAssignments: {
    type: Number,
    default: 0
  },

  // Course metadata
  language: {
    type: String,
    default: 'English'
  },
  subtitles: [{
    language: String,
    isAvailable: Boolean
  }],

  // Requirements and outcomes
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true
  }],
  skillsYouGain: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],

  // Course content structure
  modules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    duration: {
      type: Number, // minutes
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    lessons: [{
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        default: ''
      },
      content: {
        type: String, // HTML content or text
        default: ''
      },
      videoUrl: {
        type: String
      },
      videoDuration: {
        type: Number, // seconds
        default: 0
      },
      videoThumbnail: {
        type: String
      },
      resources: [{
        name: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'doc', 'ppt', 'image', 'link', 'other']
        },
        size: Number
      }],
      order: {
        type: Number,
        required: true
      },
      isFree: {
        type: Boolean,
        default: false
      },
      isPublished: {
        type: Boolean,
        default: false
      },
      completionTime: {
        type: Number, // estimated minutes to complete
        default: 0
      }
    }],
    quizzes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Quiz' 
    }],
    assignments: [{
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
      },
      title: String,
      dueDate: Date,
      maxScore: Number
    }]
  }],

  // Assessment and certification
  finalExam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  passingGrade: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  certificateTemplate: {
    type: String, // URL or template identifier
    default: 'default'
  },
  certificateRequirements: {
    completeAllLessons: {
      type: Boolean,
      default: true
    },
    passAllQuizzes: {
      type: Boolean,
      default: false
    },
    passFinalExam: {
      type: Boolean,
      default: true
    },
    minimumGrade: {
      type: Number,
      default: 70
    },
    completeAssignments: {
      type: Boolean,
      default: false
    }
  },

  // Enhanced Enrollment and Statistics
  enrollments: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    currentModule: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0
    },
    quizScores: [{
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      },
      score: Number,
      totalQuestions: Number,
      percentage: Number,
      attemptedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],

  // Enhanced Reviews System
  reviews: [{
    userId: {
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
    comment: {
      type: String,
      trim: true,
      required: true
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
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Student Activity Tracking
  studentActivity: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    activityType: {
      type: String,
      enum: ['login', 'video_watch', 'quiz_attempt', 'note_download', 'lesson_complete', 'module_complete'],
      required: true
    },
    moduleId: mongoose.Schema.Types.ObjectId,
    lessonId: mongoose.Schema.Types.ObjectId,
    videoId: mongoose.Schema.Types.ObjectId,
    quizId: mongoose.Schema.Types.ObjectId,
    duration: Number, // in minutes
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],

  // Course statistics
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // total minutes all students spent
    default: 0
  },
  activeStudentsCount: {
    type: Number,
    default: 0
  },

  // Course status and visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'unpublished'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date
  },

  // SEO and marketing
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  keywords: [String],

  // Technical fields
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
courseSchema.virtual('url').get(function() {
  return `/courses/${this.slug || this._id}`;
});

courseSchema.virtual('moduleCount').get(function() {
  return this.modules.length;
});

courseSchema.virtual('lessonCount').get(function() {
  return this.modules.reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);
});

courseSchema.virtual('totalResources').get(function() {
  return this.modules.reduce((total, module) => {
    return total + module.lessons.reduce((lessonTotal, lesson) => {
      return lessonTotal + lesson.resources.length;
    }, 0);
  }, 0);
});

courseSchema.virtual('completionRate').get(function() {
  if (this.enrollmentCount === 0) return 0;
  return ((this.completionCount / this.enrollmentCount) * 100).toFixed(1);
});

courseSchema.virtual('isDiscounted').get(function() {
  return this.discountedPrice && this.discountedPrice < this.price;
});

courseSchema.virtual('discountPercentage').get(function() {
  if (!this.isDiscounted) return 0;
  return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
});

courseSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

courseSchema.virtual('activeStudents').get(function() {
  // Students who accessed the course in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeStudentIds = new Set();
  
  this.studentActivity.forEach(activity => {
    if (activity.timestamp > twentyFourHoursAgo) {
      activeStudentIds.add(activity.studentId.toString());
    }
  });
  
  return Array.from(activeStudentIds);
});

// Indexes for better performance
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructorId: 1 });
courseSchema.index({ status: 1, isFeatured: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ 'modules.lessons.isPublished': 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ 'enrollments.studentId': 1 });
courseSchema.index({ 'reviews.userId': 1 });
courseSchema.index({ 'studentActivity.studentId': 1 });
courseSchema.index({ 'studentActivity.timestamp': -1 });

// Pre-save middleware
courseSchema.pre('save', async function(next) {
  // Generate slug from title if not provided
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  // Update total counts
  if (this.isModified('modules')) {
    this.totalModules = this.modules.length;
    this.totalLessons = this.modules.reduce((total, module) => {
      return total + module.lessons.length;
    }, 0);
    
    // Calculate total duration
    let totalDuration = 0;
    this.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalDuration += lesson.completionTime || 0;
      });
    });
    this.duration = totalDuration;
  }

  // Update enrollment count
  if (this.isModified('enrollments')) {
    this.enrollmentCount = this.enrollments.length;
    this.completionCount = this.enrollments.filter(enrollment => enrollment.completed).length;
  }

  // Update average rating
  if (this.isModified('reviews') && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = parseFloat((totalRating / this.reviews.length).toFixed(1));
    this.ratingCount = this.reviews.length;
  }

  // Update active students count
  if (this.isModified('studentActivity')) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeStudentIds = new Set();
    
    this.studentActivity.forEach(activity => {
      if (activity.timestamp > twentyFourHoursAgo) {
        activeStudentIds.add(activity.studentId.toString());
      }
    });
    
    this.activeStudentsCount = activeStudentIds.size;
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  this.lastUpdated = new Date();
  next();
});

// Static methods
courseSchema.statics.findPublished = function() {
  return this.find({ status: 'published', isActive: true });
};

courseSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'published', isActive: true });
};

courseSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, status: 'published', isActive: true });
};

courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructorId, isActive: true });
};

courseSchema.statics.getCourseAnalytics = function(courseId) {
  return this.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
    {
      $project: {
        title: 1,
        enrollmentCount: 1,
        completionCount: 1,
        averageRating: 1,
        ratingCount: 1,
        activeStudentsCount: 1,
        completionRate: {
          $cond: {
            if: { $eq: ['$enrollmentCount', 0] },
            then: 0,
            else: { $multiply: [{ $divide: ['$completionCount', '$enrollmentCount'] }, 100] }
          }
        },
        totalTimeSpent: 1,
        averageTimeSpent: {
          $cond: {
            if: { $eq: ['$enrollmentCount', 0] },
            then: 0,
            else: { $divide: ['$totalTimeSpent', '$enrollmentCount'] }
          }
        }
      }
    }
  ]);
};

// Instance methods
courseSchema.methods.enrollStudent = function(studentId) {
  const existingEnrollment = this.enrollments.find(
    enrollment => enrollment.studentId.toString() === studentId.toString()
  );

  if (!existingEnrollment) {
    this.enrollments.push({
      studentId,
      enrolledAt: new Date()
    });
    this.enrollmentCount += 1;
  }
  return this.save();
};

courseSchema.methods.unenrollStudent = function(studentId) {
  const enrollmentIndex = this.enrollments.findIndex(
    enrollment => enrollment.studentId.toString() === studentId.toString()
  );
  
  if (enrollmentIndex > -1) {
    this.enrollments.splice(enrollmentIndex, 1);
    this.enrollmentCount -= 1;
  }
  return this.save();
};

courseSchema.methods.updateStudentProgress = function(studentId, progress, currentModule = 0) {
  const enrollment = this.enrollments.find(
    enroll => enroll.studentId.toString() === studentId.toString()
  );
  
  if (enrollment) {
    enrollment.progress = progress;
    enrollment.currentModule = currentModule;
    enrollment.lastAccessed = new Date();
    
    if (progress >= 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
      this.completionCount += 1;
    }
  }
  
  return this.save();
};

courseSchema.methods.addStudentActivity = function(studentId, activityType, details = {}) {
  this.studentActivity.push({
    studentId,
    activityType,
    ...details,
    timestamp: new Date()
  });
  
  // Update last accessed in enrollment
  const enrollment = this.enrollments.find(
    enroll => enroll.studentId.toString() === studentId.toString()
  );
  
  if (enrollment) {
    enrollment.lastAccessed = new Date();
  }
  
  return this.save();
};

courseSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user is enrolled
  const isEnrolled = this.enrollments.some(
    enrollment => enrollment.studentId.toString() === userId.toString()
  );
  
  if (!isEnrolled) {
    throw new Error('Only enrolled students can review courses');
  }

  // Get student progress for verified review
  const enrollment = this.enrollments.find(
    enroll => enroll.studentId.toString() === userId.toString()
  );
  const studentProgress = enrollment ? enrollment.progress : 0;

  // Check if user already reviewed
  const existingReviewIndex = this.reviews.findIndex(
    review => review.userId.toString() === userId.toString()
  );

  if (existingReviewIndex > -1) {
    // Update existing review
    this.reviews[existingReviewIndex].rating = rating;
    this.reviews[existingReviewIndex].comment = comment;
    this.reviews[existingReviewIndex].studentProgress = studentProgress;
    this.reviews[existingReviewIndex].updatedAt = new Date();
  } else {
    // Add new review
    this.reviews.push({
      userId,
      rating,
      comment,
      studentProgress,
      isVerified: studentProgress > 50, // Mark as verified if progress > 50%
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return this.save();
};

courseSchema.methods.getStudentProgress = function(studentId) {
  const enrollment = this.enrollments.find(
    enroll => enroll.studentId.toString() === studentId.toString()
  );
  return enrollment || null;
};

courseSchema.methods.getActiveStudents = function(hours = 24) {
  const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
  const activeStudentIds = new Set();
  
  this.studentActivity.forEach(activity => {
    if (activity.timestamp > timeThreshold) {
      activeStudentIds.add(activity.studentId.toString());
    }
  });
  
  return Array.from(activeStudentIds);
};

courseSchema.methods.getEnrollmentStats = function() {
  const totalEnrollments = this.enrollmentCount;
  const completedEnrollments = this.enrollments.filter(enroll => enroll.completed).length;
  const inProgressEnrollments = totalEnrollments - completedEnrollments;
  
  return {
    total: totalEnrollments,
    completed: completedEnrollments,
    inProgress: inProgressEnrollments,
    completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0
  };
};

courseSchema.methods.getStudentActivitySummary = function(days = 7) {
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recentActivities = this.studentActivity.filter(
    activity => activity.timestamp > dateThreshold
  );
  
  const activityByType = recentActivities.reduce((acc, activity) => {
    acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalActivities: recentActivities.length,
    activitiesByType: activityByType,
    uniqueStudents: new Set(recentActivities.map(activity => activity.studentId.toString())).size
  };
};

courseSchema.methods.canIssueCertificate = function(studentId) {
  const enrollment = this.getStudentProgress(studentId);
  if (!enrollment || !enrollment.completed) return false;

  const requirements = this.certificateRequirements;
  let canIssue = true;
  
  if (requirements.completeAllLessons && enrollment.progress < 100) {
    canIssue = false;
  }
  
  // Check if student passed final exam if required
  if (requirements.passFinalExam && this.finalExam) {
    const finalQuizScore = enrollment.quizScores.find(
      score => score.quizId.toString() === this.finalExam.toString()
    );
    
    if (!finalQuizScore || finalQuizScore.percentage < requirements.minimumGrade) {
      canIssue = false;
    }
  }
  
  return canIssue;
};

courseSchema.methods.getCompletionStats = function() {
  return {
    totalEnrollments: this.enrollmentCount,
    totalCompletions: this.completionCount,
    completionRate: this.completionRate,
    averageRating: this.averageRating,
    totalReviews: this.ratingCount,
    activeStudents: this.activeStudentsCount
  };
};

// Query helpers
courseSchema.query.byStatus = function(status) {
  return this.where({ status });
};

courseSchema.query.byCategory = function(category) {
  return this.where({ category });
};

courseSchema.query.byLevel = function(level) {
  return this.where({ level });
};

courseSchema.query.featured = function() {
  return this.where({ isFeatured: true });
};

courseSchema.query.active = function() {
  return this.where({ isActive: true });
};

courseSchema.query.withEnrollments = function() {
  return this.populate('enrollments.studentId', 'name email profile.avatar');
};

courseSchema.query.withReviews = function() {
  return this.populate('reviews.userId', 'name email profile.avatar');
};

export default mongoose.model('Course', courseSchema);