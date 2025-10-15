import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'instructor'], 
    default: 'student' 
  },
  
  // Enhanced enrolled courses with progress tracking
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
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
    completedAt: {
      type: Date
    },
    currentModule: {
      type: Number,
      default: 0
    },
    totalModules: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
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
  
  // Track completed courses separately
  completedCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    finalScore: {
      type: Number,
      min: 0,
      max: 100
    },
    certificateId: {
      type: String
    }
  }],
  
  // Certificates earned
  certificates: [{
    certificateId: {
      type: String,
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    courseName: {
      type: String,
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    verifyUrl: {
      type: String
    },
    downloaded: {
      type: Boolean,
      default: false
    },
    downloadedAt: {
      type: Date
    }
  }],
  
  // User profile and preferences
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 500
    },
    phone: {
      type: String
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  
  // Learning statistics
  learningStats: {
    totalCoursesEnrolled: {
      type: Number,
      default: 0
    },
    totalCoursesCompleted: {
      type: Number,
      default: 0
    },
    totalLearningHours: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  
  // OTP for password reset
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedAt: {
    type: Date
  }
  
}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to enroll in a course
userSchema.methods.enrollInCourse = function(courseId, totalModules = 0) {
  const alreadyEnrolled = this.enrolledCourses.some(
    course => course.courseId.toString() === courseId.toString()
  );
  
  if (!alreadyEnrolled) {
    this.enrolledCourses.push({
      courseId,
      totalModules,
      enrolledAt: new Date()
    });
    this.learningStats.totalCoursesEnrolled += 1;
  }
  
  return this.save();
};

// Method to update course progress
userSchema.methods.updateCourseProgress = function(courseId, progress, currentModule = 0) {
  const courseIndex = this.enrolledCourses.findIndex(
    course => course.courseId.toString() === courseId.toString()
  );
  
  if (courseIndex !== -1) {
    this.enrolledCourses[courseIndex].progress = progress;
    this.enrolledCourses[courseIndex].currentModule = currentModule;
    this.enrolledCourses[courseIndex].lastAccessed = new Date();
    
    // Mark as completed if progress is 100%
    if (progress >= 100 && !this.enrolledCourses[courseIndex].completed) {
      this.enrolledCourses[courseIndex].completed = true;
      this.enrolledCourses[courseIndex].completedAt = new Date();
      
      // Add to completed courses
      this.completedCourses.push({
        courseId,
        completedAt: new Date()
      });
      
      this.learningStats.totalCoursesCompleted += 1;
    }
  }
  
  return this.save();
};

// Method to add quiz score
userSchema.methods.addQuizScore = function(courseId, quizId, score, totalQuestions) {
  const percentage = (score / totalQuestions) * 100;
  const courseIndex = this.enrolledCourses.findIndex(
    course => course.courseId.toString() === courseId.toString()
  );
  
  if (courseIndex !== -1) {
    this.enrolledCourses[courseIndex].quizScores.push({
      quizId,
      score,
      totalQuestions,
      percentage,
      attemptedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to add certificate
userSchema.methods.addCertificate = function(certificateData) {
  this.certificates.push({
    certificateId: certificateData.certificateId,
    courseId: certificateData.courseId,
    courseName: certificateData.courseName,
    issueDate: certificateData.issueDate,
    verifyUrl: certificateData.verifyUrl
  });
  
  // Update completed course with certificate ID
  const completedCourseIndex = this.completedCourses.findIndex(
    course => course.courseId.toString() === certificateData.courseId.toString()
  );
  
  if (completedCourseIndex !== -1) {
    this.completedCourses[completedCourseIndex].certificateId = certificateData.certificateId;
  }
  
  return this.save();
};

// Method to mark certificate as downloaded
userSchema.methods.markCertificateDownloaded = function(certificateId) {
  const certificateIndex = this.certificates.findIndex(
    cert => cert.certificateId === certificateId
  );
  
  if (certificateIndex !== -1) {
    this.certificates[certificateIndex].downloaded = true;
    this.certificates[certificateIndex].downloadedAt = new Date();
  }
  
  return this.save();
};

// Method to update learning stats
userSchema.methods.updateLearningStats = function(learningMinutes = 0) {
  this.learningStats.totalLearningHours += learningMinutes / 60;
  this.learningStats.lastActive = new Date();
  
  // Update streak logic (simplified)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (this.learningStats.lastActive.toDateString() === yesterday.toDateString()) {
    this.learningStats.currentStreak += 1;
  } else if (this.learningStats.lastActive.toDateString() !== today.toDateString()) {
    this.learningStats.currentStreak = 1;
  }
  
  if (this.learningStats.currentStreak > this.learningStats.longestStreak) {
    this.learningStats.longestStreak = this.learningStats.currentStreak;
  }
  
  return this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Transform output to remove password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpExpires;
  delete user.emailVerificationToken;
  return user;
};

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'enrolledCourses.courseId': 1 });
userSchema.index({ 'completedCourses.courseId': 1 });
userSchema.index({ 'certificates.certificateId': 1 });

export default mongoose.model('User', userSchema);