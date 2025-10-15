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

  // Enrollment and statistics
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

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

// Indexes for better performance
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructorId: 1 });
courseSchema.index({ status: 1, isFeatured: 1 });
courseSchema.index({ slug: 1 });
courseSchema.index({ 'modules.lessons.isPublished': 1 });
courseSchema.index({ createdAt: -1 });

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
  if (this.isModified('enrolledStudents')) {
    this.enrollmentCount = this.enrolledStudents.length;
  }

  // Update average rating
  if (this.isModified('reviews') && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = parseFloat((totalRating / this.reviews.length).toFixed(1));
    this.ratingCount = this.reviews.length;
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

// Instance methods
courseSchema.methods.enrollStudent = function(studentId) {
  if (!this.enrolledStudents.includes(studentId)) {
    this.enrolledStudents.push(studentId);
    this.enrollmentCount += 1;
  }
  return this.save();
};

courseSchema.methods.unenrollStudent = function(studentId) {
  const index = this.enrolledStudents.indexOf(studentId);
  if (index > -1) {
    this.enrolledStudents.splice(index, 1);
    this.enrollmentCount -= 1;
  }
  return this.save();
};

courseSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user already reviewed
  const existingReviewIndex = this.reviews.findIndex(
    review => review.userId.toString() === userId.toString()
  );

  if (existingReviewIndex > -1) {
    // Update existing review
    this.reviews[existingReviewIndex].rating = rating;
    this.reviews[existingReviewIndex].comment = comment;
    this.reviews[existingReviewIndex].createdAt = new Date();
  } else {
    // Add new review
    this.reviews.push({
      userId,
      rating,
      comment,
      createdAt: new Date()
    });
  }

  return this.save();
};

courseSchema.methods.getStudentProgress = async function(studentId) {
  const User = mongoose.model('User');
  const user = await User.findById(studentId);
  
  if (!user) return null;

  const enrollment = user.enrolledCourses.find(
    course => course.courseId.toString() === this._id.toString()
  );

  return enrollment ? enrollment.progress : 0;
};

courseSchema.methods.canIssueCertificate = function(studentProgress, finalExamScore = 0) {
  const requirements = this.certificateRequirements;
  
  let canIssue = true;
  
  if (requirements.completeAllLessons && studentProgress < 100) {
    canIssue = false;
  }
  
  if (requirements.passFinalExam && finalExamScore < requirements.minimumGrade) {
    canIssue = false;
  }
  
  return canIssue;
};

courseSchema.methods.getCompletionStats = function() {
  return {
    totalEnrollments: this.enrollmentCount,
    totalCompletions: this.completionCount,
    completionRate: this.completionRate,
    averageRating: this.averageRating,
    totalReviews: this.ratingCount
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

export default mongoose.model('Course', courseSchema);