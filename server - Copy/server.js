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

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

// Ensure videos subdirectory exists
const videosDir = path.join(uploadsDir, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log('📁 Created videos directory:', videosDir);
}

// Ensure notes subdirectory exists
const notesDir = path.join(uploadsDir, 'notes');
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
  console.log('📁 Created notes directory:', notesDir);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/clinigoal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB Connected");
  // Test route
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
})
.catch(err => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1);
});

// ==================== EMAIL TRANSPORTER SETUP ====================

// Create email transporter with better error handling
let transporter;

// Check if email configuration is available
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({ // FIXED: Changed from createTransporter to createTransport
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add this to handle connection issues
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter error:', error.message);
      console.log('📧 Email sending will be disabled. OTPs will be logged to console only.');
      transporter = null; // Set to null if verification fails
    } else {
      console.log('📧 Email transporter ready to send messages');
    }
  });
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

// User Schema
const userSchema = new mongoose.Schema({
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
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
const Video = mongoose.model('Video', videoSchema);
const Note = mongoose.model('Note', noteSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const User = mongoose.model('User', userSchema);

// ==================== AUTHENTICATION ROUTES ====================

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
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
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: "Registration failed: " + error.message });
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
    
    res.json({
      totalStudents: 0, // Placeholder
      totalFees: 0, // Placeholder
      totalCertificates: 0, // Placeholder
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
    // Placeholder data - replace with actual aggregation queries
    res.json({
      courses: ['Clinical Research', 'Bioinformatics', 'Medical Coding'],
      studentsPerCourse: [25, 18, 32],
      notesPerCourse: [12, 8, 15],
      quizzesPerCourse: [5, 3, 7],
      monthlyRevenue: [12000, 15000, 18000],
      monthlyStudents: [5, 8, 12],
      engagementRate: [65, 72, 78]
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
    // Placeholder - replace with actual student model when available
    res.json([]);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students: " + error.message });
  }
});

// Get student progress (admin)
app.get('/api/admin/student-progress', async (req, res) => {
  try {
    // Placeholder - replace with actual progress model when available
    res.json([]);
  } catch (error) {
    console.error("❌ Error fetching student progress:", error);
    res.status(500).json({ error: "Failed to fetch student progress: " + error.message });
  }
});

// Get student feedbacks (admin)
app.get('/api/admin/feedbacks', async (req, res) => {
  try {
    // Placeholder - replace with actual feedback model when available
    res.json([]);
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
    error: `Route not found: ${req.method} ${req.url}` 
  });
});

// ==================== START SERVER ==================== //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📁 Videos directory: ${videosDir}`);
  console.log(`📁 Notes directory: ${notesDir}`);
  console.log(`✅ Uploads directory exists: ${fs.existsSync(uploadsDir)}`);
  console.log(`✅ Videos directory exists: ${fs.existsSync(videosDir)}`);
  console.log(`✅ Notes directory exists: ${fs.existsSync(notesDir)}`);
  
  // Display email configuration status
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Email configuration found');
  } else {
    console.log('⚠️ Email configuration not found - OTPs will be logged to console only');
  }
});