const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// ==================== RENDER CONFIGURATIONS ====================
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 10000;

// Security check for production
if (isProduction) {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Please set these in your Render dashboard');
    process.exit(1);
  }
}

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: isProduction 
    ? ['https://clinigoal.onrender.com', 'http://localhost:3000'] // Update with your actual frontend URL
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinigoal';

// Enhanced MongoDB connection for Render
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected successfully");
    
    if (MONGODB_URI.includes('mongodb.net')) {
      console.log("📊 Database: MongoDB Atlas (Cloud)");
    } else {
      console.log("📊 Database: Local MongoDB");
    }
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    
    if (MONGODB_URI.includes('localhost') && isProduction) {
      console.error("💡 You're using local MongoDB in production! This won't work on Render.");
      console.error("💡 Please set MONGODB_URI to a MongoDB Atlas connection string in Render dashboard.");
    }
    
    process.exit(1);
  }
};

connectDB();

// ==================== RENDER-SPECIFIC SETUP ====================
// Create necessary directories for Render
const createDirectories = () => {
  const directories = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'videos'),
    path.join(__dirname, 'uploads', 'notes'),
    path.join(__dirname, 'public')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Created directory:', dir);
    }
  });
};

createDirectories();

// Directory paths
const uploadsDir = path.join(__dirname, 'uploads');
const videosDir = path.join(__dirname, 'uploads', 'videos');
const notesDir = path.join(__dirname, 'uploads', 'notes');

// Serve static files
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ENHANCED EMAIL TRANSPORTER SETUP ====================
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Better timeout settings for Render
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    secure: true,
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify with timeout for Render compatibility
  const verifyEmail = async () => {
    try {
      await transporter.verify();
      console.log('✅ Email transporter ready to send messages');
    } catch (error) {
      console.error('❌ Email transporter error:', error.message);
      console.log('📧 Email sending will be disabled. OTPs will be logged to console only.');
      transporter = null;
    }
  };
  
  verifyEmail();
} else {
  console.log('⚠️ Email configuration not found in environment variables');
  console.log('📧 Email sending will be disabled. OTPs will be logged to console only.');
}

// ==================== DEFINE SCHEMAS AND MODELS ====================

// Video Schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: 'No description provided'
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  duration: {
    type: Number,
    default: 0
  },
  module: {
    type: String,
    default: 'Module 1'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Note Schema
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    options: [{
      optionText: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        default: false
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enhanced User Schema
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
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'instructor'],
    default: 'student'
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: 500
    },
    phone: String,
    dateOfBirth: Date
  },
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
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
    }
  }],
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
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
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
  thumbnail: { 
    type: String,
    default: ''
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'Beginner'
  },
  duration: {
    type: Number,
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
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, { 
  timestamps: true 
});

// Review Schema
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

// Enrollment Schema
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
  completedAt: Date,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentModule: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number,
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
  status: {
    type: String,
    enum: ['active', 'paused', 'dropped', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Student Activity Schema
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

// Create models
const Video = mongoose.model('Video', videoSchema);
const Note = mongoose.model('Note', noteSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Review = mongoose.model('Review', reviewSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const StudentActivity = mongoose.model('StudentActivity', studentActivitySchema);

// ==================== AUTHENTICATION MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Clinigoal API Server is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      test: '/api/test',
      auth: '/api/auth',
      courses: '/api/courses',
      admin: '/api/admin',
      info: '/api/deploy-info'
    },
    documentation: 'Check the individual endpoints for more details'
  });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.json({ 
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: "Registration failed: " + error.message });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last active
    user.learningStats.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed: " + error.message });
  }
});

// Send OTP route (UPDATED with better error handling)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Update user's OTP
    user.otp = {
      code: otp,
      expiresAt
    };
    await user.save();

    // Log OTP to console
    console.log(`🔑 OTP for ${email}: ${otp}`);

    // Try to send OTP via email if transporter is available
    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP for Clinigoal',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #4a6fdc; text-align: center;">Clinigoal Verification</h2>
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) for accessing Clinigoal is:</p>
              <div style="background-color: #f0f5ff; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${otp}
              </div>
              <p>This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
              <p>If you did not request this OTP, please ignore this email.</p>
              <p>Thank you,<br>The Clinigoal Team</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 OTP sent to ${email} via email`);
        
        res.json({ 
          message: "OTP sent successfully",
          method: "email"
        });
      } catch (emailError) {
        console.error("❌ Error sending email:", emailError.message);
        // Fallback to console only
        res.json({ 
          message: "OTP generated successfully (check server console)",
          method: "console"
        });
      }
    } else {
      // No transporter available
      res.json({ 
        message: "OTP generated successfully (check server console)",
        method: "console"
      });
    }
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP: " + error.message });
  }
});

// Verify OTP route
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ error: "No OTP was sent to this user" });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined; // Clear OTP
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP: " + error.message });
  }
});

// Reset Password route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if OTP is valid and not expired
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ error: "No OTP was sent to this user" });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined; // Clear OTP
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password: " + error.message });
  }
});

// Check if user exists route
app.post('/api/auth/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const user = await User.findOne({ email });
    
    if (user) {
      return res.json({ 
        exists: true, 
        message: "User found in database" 
      });
    } else {
      return res.json({ 
        exists: false, 
        message: "User not found in database" 
      });
    }
  } catch (error) {
    console.error("❌ Error checking user:", error);
    res.status(500).json({ error: "Failed to check user: " + error.message });
  }
});

// ==================== COURSE ROUTES ====================

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses: " + error.message });
  }
});

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("❌ Error fetching course:", error);
    res.status(500).json({ error: "Failed to fetch course: " + error.message });
  }
});

// Create course (admin only)
app.post('/api/courses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin' && user.role !== 'instructor') {
      return res.status(403).json({ error: "Access denied" });
    }

    const courseData = {
      ...req.body,
      instructorId: req.user.userId
    };

    const course = new Course(courseData);
    await course.save();

    res.json({
      message: "Course created successfully",
      course
    });
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ error: "Failed to create course: " + error.message });
  }
});

// ==================== ENROLLMENT ROUTES ====================

// Enroll in a course
app.post('/api/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: userId,
      course: courseId
    });

    await enrollment.save();

    // Update user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $push: {
        enrolledCourses: {
          courseId: courseId,
          enrolledAt: new Date()
        }
      },
      $inc: {
        'learningStats.totalCoursesEnrolled': 1
      }
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    // Track enrollment activity
    const activity = new StudentActivity({
      studentId: userId,
      courseId: courseId,
      activityType: 'course_access'
    });
    await activity.save();

    res.json({ 
      message: "Successfully enrolled in course",
      enrollment 
    });
  } catch (error) {
    console.error("❌ Error enrolling in course:", error);
    res.status(500).json({ error: "Failed to enroll in course: " + error.message });
  }
});

// Get user's enrollments
app.get('/api/enrollments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title thumbnail instructor duration level category')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error("❌ Error fetching enrollments:", error);
    res.status(500).json({ error: "Failed to fetch enrollments: " + error.message });
  }
});

// Update course progress
app.put('/api/enrollments/:courseId/progress', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, currentModule, timeSpent } = req.body;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        progress,
        currentModule,
        lastAccessed: new Date(),
        $inc: { 
          totalTimeSpent: timeSpent || 0,
          accessCount: 1
        }
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Update user's course progress
    await User.findOneAndUpdate(
      { 
        _id: userId, 
        'enrolledCourses.courseId': courseId 
      },
      {
        $set: {
          'enrolledCourses.$.progress': progress,
          'enrolledCourses.$.currentModule': currentModule,
          'enrolledCourses.$.lastAccessed': new Date()
        }
      }
    );

    // Track progress activity
    const activity = new StudentActivity({
      studentId: userId,
      courseId: courseId,
      activityType: 'lesson_complete',
      duration: timeSpent
    });
    await activity.save();

    res.json({ 
      message: "Progress updated successfully",
      enrollment 
    });
  } catch (error) {
    console.error("❌ Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress: " + error.message });
  }
});

// ==================== REVIEW ROUTES ====================

// Get reviews for a course
app.get('/api/reviews/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const reviews = await Review.find({ courseId })
      .populate('studentId', 'name profile.avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews: " + error.message });
  }
});

// Add review for a course
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { courseId, rating, reviewText } = req.body;
    const userId = req.user.userId;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(400).json({ error: "You must be enrolled in the course to review it" });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      courseId,
      studentId: userId
    });

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this course" });
    }

    // Create review
    const review = new Review({
      courseId,
      studentId: userId,
      rating,
      reviewText,
      studentProgress: enrollment.progress,
      isVerified: enrollment.progress > 50
    });

    await review.save();

    // Update course rating stats
    const courseReviews = await Review.find({ courseId });
    const averageRating = courseReviews.reduce((sum, review) => sum + review.rating, 0) / courseReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount: courseReviews.length
    });

    res.json({ 
      message: "Review added successfully",
      review 
    });
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ error: "Failed to add review: " + error.message });
  }
});

// ==================== STUDENT ACTIVITY ROUTES ====================

// Track student activity
app.post('/api/student/activity', authenticateToken, async (req, res) => {
  try {
    const { courseId, activityType, moduleId, lessonId, videoId, quizId, duration } = req.body;
    
    const activity = new StudentActivity({
      studentId: req.user.userId,
      courseId,
      activityType,
      moduleId,
      lessonId,
      videoId,
      quizId,
      duration,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await activity.save();

    // Update user's last active
    await User.findByIdAndUpdate(req.user.userId, {
      'learningStats.lastActive': new Date()
    });

    res.json({ message: "Activity tracked successfully" });
  } catch (error) {
    console.error("❌ Error tracking activity:", error);
    res.status(500).json({ error: "Failed to track activity: " + error.message });
  }
});

// Get student dashboard
app.get('/api/student/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .populate('enrolledCourses.courseId', 'title thumbnail duration level category');

    const recentActivities = await StudentActivity.find({ studentId: userId })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const enrolledCourses = user.enrolledCourses;
    const completedCourses = enrolledCourses.filter(course => course.completed).length;

    res.json({
      user: {
        name: user.name,
        email: user.email,
        learningStats: user.learningStats
      },
      stats: {
        totalCourses: enrolledCourses.length,
        completedCourses,
        inProgressCourses: enrolledCourses.length - completedCourses,
        completionRate: enrolledCourses.length > 0 ? (completedCourses / enrolledCourses.length) * 100 : 0
      },
      enrolledCourses: enrolledCourses,
      recentActivities
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data: " + error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Multer config for admin routes
const adminStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    let dir;
    if (file.mimetype.startsWith('video/')) {
      dir = videosDir;
    } else {
      dir = notesDir;
    }
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Created directory:', dir);
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    console.log('📄 Generated filename:', uniqueName);
    cb(null, uniqueName);
  }
});

const adminUpload = multer({ 
  storage: adminStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: function(req, file, cb) {
    console.log('📁 File filter - MIME type:', file.mimetype);
    cb(null, true);
  }
});

// Helper function to safely delete files
const safeDeleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(path.join(__dirname, filePath))) {
      fs.unlinkSync(path.join(__dirname, filePath));
      console.log(`🗑️ File deleted: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Error deleting file ${filePath}:`, err);
  }
};

// ----------------- ADMIN STATS ROUTE ----------------- //
app.get('/api/admin/stats', async (req, res) => {
  try {
    const videosCount = await Video.countDocuments();
    const notesCount = await Note.countDocuments();
    const quizzesCount = await Quiz.countDocuments();
    const coursesCount = await Course.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const enrollmentsCount = await Enrollment.countDocuments();
    const reviewsCount = await Review.countDocuments();
    
    res.json({
      totalStudents: studentsCount,
      totalCourses: coursesCount,
      totalEnrollments: enrollmentsCount,
      totalReviews: reviewsCount,
      totalNotes: notesCount,
      totalQuizzes: quizzesCount,
      totalVideos: videosCount,
      activeStudents: 0, // Placeholder
      completionRate: 0 // Placeholder
    });
  } catch (error) {
    console.error("❌ Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch stats: " + error.message });
  }
});

// ----------------- ADMIN CHART DATA ROUTE ----------------- //
app.get('/api/admin/chart-data', async (req, res) => {
  try {
    // Get real data from database
    const courses = await Course.find().select('title enrollmentCount').limit(5);
    const studentsPerCourse = courses.map(course => course.enrollmentCount);
    const courseNames = courses.map(course => course.title);

    res.json({
      courses: courseNames,
      studentsPerCourse: studentsPerCourse,
      notesPerCourse: [12, 8, 15, 10, 7],
      quizzesPerCourse: [5, 3, 7, 4, 2],
      monthlyRevenue: [12000, 15000, 18000, 16000, 14000, 17000],
      monthlyStudents: [5, 8, 12, 10, 7, 9],
      engagementRate: [65, 72, 78, 70, 68, 75]
    });
  } catch (error) {
    console.error("❌ Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data: " + error.message });
  }
});

// ----------------- ADMIN VIDEO ROUTES ----------------- //

// Get all videos (admin)
app.get('/api/admin/videos', async (req, res) => {
  try {
    console.log('📹 Fetching all admin videos');
    const videos = await Video.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${videos.length} videos`);
    res.json(videos);
  } catch (error) {
    console.error("❌ Error fetching admin videos:", error);
    res.status(500).json({ error: "Failed to fetch videos: " + error.message });
  }
});

// Upload video (admin)
app.post('/api/admin/videos', adminUpload.single('file'), async (req, res) => {
  console.log('🚀 ========== VIDEO UPLOAD START ==========');
  
  try {
    console.log('📹 Admin video upload request received');
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request body:', req.body);
    console.log('📁 File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    } : '❌ No file uploaded');

    if (!req.file) {
      console.log('❌ No file received in request');
      return res.status(400).json({ 
        error: "No video file uploaded. Please select a file." 
      });
    }

    const { title, course, description, duration, module } = req.body;
    console.log('📝 Form data:', { title, course, description, duration, module });
    
    if (!title || !title.trim()) {
      safeDeleteFile(req.file.path);
      return res.status(400).json({ 
        error: "Title is required" 
      });
    }

    if (!course || !course.trim()) {
      safeDeleteFile(req.file.path);
      return res.status(400).json({ 
        error: "Course is required" 
      });
    }

    const videoData = {
      title: title.trim(),
      course: course.trim(),
      description: description ? description.trim() : 'No description provided',
      url: '/uploads/videos/' + req.file.filename,
      duration: duration ? parseInt(duration) : 0,
      module: module ? module.trim() : 'Module 1'
    };

    console.log('💾 Creating video with data:', videoData);

    const video = new Video(videoData);
    await video.save();

    console.log('✅ Video saved to database:', video._id);
    console.log('🎉 Video upload completed successfully');
    
    res.json({
      _id: video._id,
      title: video.title,
      course: video.course,
      description: video.description,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
      module: video.module,
      createdAt: video.createdAt
    });

  } catch (error) {
    console.error('❌ ERROR in video upload:', error);
    
    if (req.file && req.file.path) {
      safeDeleteFile(req.file.path);
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "A video with this title already exists" 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to upload video: ' + error.message 
    });
  } finally {
    console.log('🏁 ========== VIDEO UPLOAD END ==========');
  }
});

// Update video (admin)
app.put('/api/admin/videos/:id', adminUpload.single('file'), async (req, res) => {
  try {
    console.log('📹 Updating video:', req.params.id);
    
    const { title, course, description, duration, module } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    console.log('📝 Update data:', { title, course, description, duration, module, hasFile: !!req.file });

    const oldUrl = video.url;
    video.title = title || video.title;
    video.course = course || video.course;
    video.description = description || video.description;
    video.duration = duration ? parseInt(duration) : video.duration;
    video.module = module || video.module;

    if (req.file) {
      video.url = '/uploads/videos/' + req.file.filename;
    }

    await video.save();
    
    if (oldUrl && oldUrl !== video.url && req.file) {
      safeDeleteFile(oldUrl);
    }
    
    console.log('✅ Video updated successfully');
    res.json(video);
  } catch (error) {
    console.error('❌ Error updating admin video:', error);
    res.status(500).json({ error: "Failed to update video: " + error.message });
  }
});

// Delete video (admin)
app.delete('/api/admin/videos/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting video:', req.params.id);
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    safeDeleteFile(video.url);
    await Video.findByIdAndDelete(req.params.id);
    
    console.log('✅ Video deleted successfully');
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error('❌ Error deleting admin video:', error);
    res.status(500).json({ error: "Failed to delete video: " + error.message });
  }
});

// ----------------- ADMIN NOTE ROUTES ----------------- //

// Get all notes (admin)
app.get('/api/admin/notes', async (req, res) => {
  try {
    console.log('📝 Fetching all admin notes');
    const notes = await Note.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${notes.length} notes`);
    res.json(notes);
  } catch (error) {
    console.error("❌ Error fetching admin notes:", error);
    res.status(500).json({ error: "Failed to fetch notes: " + error.message });
  }
});

// Upload note (admin)
app.post('/api/admin/notes', adminUpload.single('file'), async (req, res) => {
  console.log('🚀 ========== NOTE UPLOAD START ==========');
  
  try {
    console.log('📝 Admin note upload request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : '❌ No file uploaded');

    const { title, course } = req.body;
    
    if (!title || !course) {
      if (req.file) {
        safeDeleteFile(req.file.path);
      }
      return res.status(400).json({ error: "Title and course are required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }
    
    const noteData = {
      title: title.trim(),
      course: course.trim(),
      url: '/uploads/notes/' + req.file.filename,
      fileType: req.file.mimetype,
      pages: 0
    };

    console.log('💾 Creating note with data:', noteData);
    
    const note = new Note(noteData);
    await note.save();

    console.log('✅ Note saved to database:', note._id);
    console.log('🎉 Note upload completed successfully');
    
    res.json(note);
  } catch (err) {
    console.error("❌ Error uploading admin note:", err);
    
    if (req.file) {
      safeDeleteFile(req.file.path);
    }
    
    res.status(500).json({ error: "Failed to upload note: " + err.message });
  } finally {
    console.log('🏁 ========== NOTE UPLOAD END ==========');
  }
});

// Update note (admin)
app.put('/api/admin/notes/:id', adminUpload.single('file'), async (req, res) => {
  try {
    const { title, course } = req.body;
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const oldUrl = note.url;
    note.title = title || note.title;
    note.course = course || note.course;

    if (req.file) {
      note.url = '/uploads/notes/' + req.file.filename;
      note.fileType = req.file.mimetype;
    }

    await note.save();
    
    if (oldUrl && oldUrl !== note.url && req.file) {
      safeDeleteFile(oldUrl);
    }
    
    res.json(note);
  } catch (err) {
    console.error("❌ Error updating admin note:", err);
    res.status(500).json({ error: "Failed to update note: " + err.message });
  }
});

// Delete note (admin)
app.delete('/api/admin/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    safeDeleteFile(note.url);
    await Note.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting admin note:", err);
    res.status(500).json({ error: "Failed to delete note: " + err.message });
  }
});

// ----------------- ADMIN QUIZ ROUTES ----------------- //

// Get all quizzes (admin)
app.get('/api/admin/quizzes', async (req, res) => {
  try {
    console.log('❓ Fetching all admin quizzes');
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${quizzes.length} quizzes`);
    res.json(quizzes);
  } catch (error) {
    console.error("❌ Error fetching admin quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes: " + error.message });
  }
});

// Get a single quiz by ID (admin)
app.get('/api/admin/quizzes/:id', async (req, res) => {
  try {
    console.log('❓ Fetching quiz with ID:', req.params.id);
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    console.log('✅ Found quiz:', quiz.title);
    res.json(quiz);
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    res.status(500).json({ error: "Failed to fetch quiz: " + error.message });
  }
});

// Create quiz (admin)
app.post('/api/admin/quizzes', async (req, res) => {
  try {
    console.log('🚀 ========== QUIZ CREATE START ==========');
    console.log('📝 Quiz data:', req.body);

    const { title, course, questions } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!course || !course.trim()) {
      return res.status(400).json({ error: "Course is required" });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "At least one question is required" });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({ error: `Question ${i+1} text is required` });
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ error: `Question ${i+1} must have at least 2 options` });
      }

      let hasCorrectOption = false;
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.optionText || !opt.optionText.trim()) {
          return res.status(400).json({ error: `Option ${j+1} of question ${i+1} text is required` });
        }
        if (opt.isCorrect) {
          hasCorrectOption = true;
        }
      }

      if (!hasCorrectOption) {
        return res.status(400).json({ error: `Question ${i+1} must have at least one correct option` });
      }
    }

    const quizData = {
      title: title.trim(),
      course: course.trim(),
      questions: questions
    };

    console.log('💾 Creating quiz with data:', quizData);

    const quiz = new Quiz(quizData);
    await quiz.save();

    console.log('✅ Quiz saved to database:', quiz._id);
    console.log('🎉 Quiz creation completed successfully');

    res.json(quiz);
  } catch (error) {
    console.error('❌ ERROR in quiz creation:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "A quiz with this title already exists" 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create quiz: ' + error.message 
    });
  } finally {
    console.log('🏁 ========== QUIZ CREATE END ==========');
  }
});

// Update quiz (admin)
app.put('/api/admin/quizzes/:id', async (req, res) => {
  try {
    console.log('❓ Updating quiz:', req.params.id);
    
    const { title, course, questions } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!course || !course.trim()) {
      return res.status(400).json({ error: "Course is required" });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "At least one question is required" });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({ error: `Question ${i+1} text is required` });
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ error: `Question ${i+1} must have at least 2 options` });
      }

      let hasCorrectOption = false;
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.optionText || !opt.optionText.trim()) {
          return res.status(400).json({ error: `Option ${j+1} of question ${i+1} text is required` });
        }
        if (opt.isCorrect) {
          hasCorrectOption = true;
        }
      }

      if (!hasCorrectOption) {
        return res.status(400).json({ error: `Question ${i+1} must have at least one correct option` });
      }
    }

    quiz.title = title.trim();
    quiz.course = course.trim();
    quiz.questions = questions;

    await quiz.save();
    
    console.log('✅ Quiz updated successfully');
    res.json(quiz);
  } catch (error) {
    console.error('❌ Error updating admin quiz:', error);
    res.status(500).json({ error: "Failed to update quiz: " + error.message });
  }
});

// Delete quiz (admin)
app.delete('/api/admin/quizzes/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting quiz:', req.params.id);
    
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    await Quiz.findByIdAndDelete(req.params.id);
    
    console.log('✅ Quiz deleted successfully');
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error('❌ Error deleting admin quiz:', error);
    res.status(500).json({ error: "Failed to delete quiz: " + error.message });
  }
});

// ----------------- ADMIN STUDENT ROUTES ----------------- //

// Get all students (admin)
app.get('/api/admin/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email profile learningStats createdAt');
    res.json(students);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students: " + error.message });
  }
});

// Get student progress (admin)
app.get('/api/admin/student-progress', async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ progress: -1 });
    res.json(enrollments);
  } catch (error) {
    console.error("❌ Error fetching student progress:", error);
    res.status(500).json({ error: "Failed to fetch student progress: " + error.message });
  }
});

// Get student feedbacks (admin)
app.get('/api/admin/feedbacks', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("❌ Error fetching feedbacks:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks: " + error.message });
  }
});

// Test endpoint to check if admin routes are working
app.get('/api/admin/test', (req, res) => {
  console.log('🧪 Admin test route called');
  res.json({ 
    message: 'Admin routes are working!',
    timestamp: new Date().toISOString(),
    uploadsDir: uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir)
  });
});

// Test file upload endpoint
app.post('/api/admin/test-upload', adminUpload.single('file'), (req, res) => {
  console.log('🧪 Test upload endpoint called');
  console.log('📋 Request body:', req.body);
  console.log('📁 File:', req.file);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'Test upload successful!',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    },
    body: req.body
  });
});

// ==================== USER ROUTES ====================

// Get videos by course ID (user)
app.get('/api/videos/course/:courseId', async (req, res) => {
  try {
    console.log('📹 Fetching videos for course:', req.params.courseId);
    const videos = await Video.find({ course: req.params.courseId }).sort({ createdAt: 1 });
    console.log(`✅ Found ${videos.length} videos for course ${req.params.courseId}`);
    res.json(videos);
  } catch (error) {
    console.error("❌ Error fetching videos by course:", error);
    res.status(500).json({ error: "Failed to fetch videos: " + error.message });
  }
});

// Get notes by course ID (user)
app.get('/api/notes/course/:courseId', async (req, res) => {
  try {
    console.log('📝 Fetching notes for course:', req.params.courseId);
    const notes = await Note.find({ course: req.params.courseId }).sort({ createdAt: 1 });
    console.log(`✅ Found ${notes.length} notes for course ${req.params.courseId}`);
    res.json(notes);
  } catch (error) {
    console.error("❌ Error fetching notes by course:", error);
    res.status(500).json({ error: "Failed to fetch notes: " + error.message });
  }
});

// Get quizzes by course ID (user)
app.get('/api/quizzes/course/:courseId', async (req, res) => {
  try {
    console.log('❓ Fetching quizzes for course:', req.params.courseId);
    const quizzes = await Quiz.find({ course: req.params.courseId }).sort({ createdAt: 1 });
    console.log(`✅ Found ${quizzes.length} quizzes for course ${req.params.courseId}`);
    res.json(quizzes);
  } catch (error) {
    console.error("❌ Error fetching quizzes by course:", error);
    res.status(500).json({ error: "Failed to fetch quizzes: " + error.message });
  }
});

// ==================== TEST DATA ROUTES ====================

// Create test data
app.post('/api/debug/create-test-data', async (req, res) => {
  try {
    console.log("🧪 Creating test data...");

    // Create test course
    const testCourse = new Course({
      title: "Clinical Research Fundamentals",
      description: "Learn the basics of clinical research methodology and practices",
      category: "Clinical Research",
      instructor: "Dr. Sarah Johnson",
      instructorId: new mongoose.Types.ObjectId(),
      price: 199,
      level: "Beginner",
      status: "published"
    });
    await testCourse.save();
    console.log("✅ Test course created:", testCourse._id);

    res.json({
      success: true,
      message: "Test data created successfully",
      data: {
        courseId: testCourse._id
      }
    });

  } catch (error) {
    console.error("❌ Error creating test data:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// View all data
app.get('/api/debug/view-data', async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt').lean();
    const courses = await Course.find().select('title category instructor status enrollmentCount averageRating createdAt').lean();
    const enrollments = await Enrollment.find().populate('user', 'name').populate('course', 'title').lean();
    const reviews = await Review.find().populate('studentId', 'name').populate('courseId', 'title').lean();
    const videos = await Video.find().select('title course duration createdAt').lean();
    const notes = await Note.find().select('title course fileType createdAt').lean();
    const quizzes = await Quiz.find().select('title course questions createdAt').lean();
    const activities = await StudentActivity.find().populate('studentId', 'name').populate('courseId', 'title').limit(10).lean();

    res.json({
      success: true,
      data: {
        users: {
          count: users.length,
          items: users
        },
        courses: {
          count: courses.length,
          items: courses
        },
        enrollments: {
          count: enrollments.length,
          items: enrollments
        },
        reviews: {
          count: reviews.length,
          items: reviews
        },
        videos: {
          count: videos.length,
          items: videos
        },
        notes: {
          count: notes.length,
          items: notes
        },
        quizzes: {
          count: quizzes.length,
          items: quizzes
        },
        activities: {
          count: await StudentActivity.countDocuments(),
          recent: activities
        }
      }
    });

  } catch (error) {
    console.error("❌ Error viewing data:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ==================== RENDER HEALTH CHECKS ====================

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Render-specific info endpoint
app.get('/api/deploy-info', (req, res) => {
  res.json({
    deployed: true,
    platform: 'Render',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    memory: process.memoryUsage(),
    uploadsDir: uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ==================== ERROR HANDLING ====================

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🔥 Global Error Handler:', error);
  
  if (error instanceof multer.MulterError) {
    console.error('📁 Multer Error:', error.code);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 100MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Only one file allowed per request.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field. Please check the file field name.'
      });
    }
  }
  
  res.status(500).json({ 
    error: error.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.url);
  res.status(404).json({ 
    error: `Route not found: ${req.method} ${req.url}`,
    available_endpoints: {
      root: '/',
      health: '/health',
      test: '/api/test',
      auth: '/api/auth/*',
      courses: '/api/courses',
      admin: '/api/admin/*',
      info: '/api/deploy-info'
    }
  });
});

// ==================== START SERVER ==================== //
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`✅ Server is ready to accept requests`);
  
  if (isProduction) {
    console.log('🚨 PRODUCTION MODE: File uploads use ephemeral storage');
    console.log('💡 Consider using cloud storage for persistent file storage');
  }
});