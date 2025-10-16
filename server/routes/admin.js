import express from "express";
import multer from "multer";
import Video from "../models/Video.js";
import Note from "../models/Note.js";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ==================== COURSE ROUTES ====================

// Get all courses (for admin)
router.get("/courses", async (req, res) => {
  try {
    console.log("📚 Fetching courses for admin...");
    const courses = await Course.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${courses.length} courses`);
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Get single course
router.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// Create new course
router.post("/courses", async (req, res) => {
  try {
    console.log("📥 Creating new course:", req.body);
    
    const {
      title,
      description,
      instructor,
      price,
      discountedPrice,
      category,
      level,
      duration,
      thumbnail,
      requirements,
      whatYouWillLearn,
      skillsYouGain,
      targetAudience
    } = req.body;

    const newCourse = new Course({
      title,
      description: description || "Comprehensive course covering essential topics",
      instructor: instructor || "Admin Instructor",
      instructorId: new mongoose.Types.ObjectId(),
      price: price || 9999,
      discountedPrice: discountedPrice || null,
      category: category || "Clinical Research",
      level: level || "Beginner",
      duration: duration || 480,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      requirements: requirements || ["Basic knowledge of the subject"],
      whatYouWillLearn: whatYouWillLearn || [
        "Fundamental concepts and principles",
        "Practical applications and techniques",
        "Industry best practices",
        "Real-world case studies"
      ],
      skillsYouGain: skillsYouGain || [
        "Professional competency",
        "Problem-solving skills",
        "Technical expertise",
        "Industry recognition"
      ],
      targetAudience: targetAudience || ["Students", "Professionals", "Career changers"],
      status: "published",
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });

    const savedCourse = await newCourse.save();
    console.log("✅ Course created successfully:", savedCourse.title);
    
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ error: "Failed to create course: " + error.message });
  }
});

// Update course
router.put("/courses/:id", async (req, res) => {
  try {
    console.log("🔄 Updating course:", req.params.id);
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    console.log("✅ Course updated successfully:", updatedCourse.title);
    res.json(updatedCourse);
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({ error: "Failed to update course: " + error.message });
  }
});

// Delete course (soft delete)
router.delete("/courses/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false, lastUpdated: new Date() },
      { new: true }
    );

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    console.log("✅ Course deleted successfully:", deletedCourse.title);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// Publish course
router.patch("/courses/:id/publish", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { 
        status: "published",
        publishedAt: new Date()
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ message: "Course published successfully", course });
  } catch (error) {
    res.status(500).json({ error: "Failed to publish course" });
  }
});

// Unpublish course
router.patch("/courses/:id/unpublish", async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "unpublished" },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ message: "Course unpublished successfully", course });
  } catch (error) {
    res.status(500).json({ error: "Failed to unpublish course" });
  }
});

// Setup demo courses
router.post("/courses/setup-demo", async (req, res) => {
  try {
    console.log("🔄 Setting up demo courses...");
    
    const demoCourses = [
      {
        title: "Clinical Research Fundamentals",
        description: "Comprehensive training in clinical research methodologies, regulatory affairs, and clinical trial management.",
        instructor: "Dr. Sarah Johnson",
        instructorId: new mongoose.Types.ObjectId(),
        price: 15999,
        discountedPrice: 12999,
        category: "Clinical Research",
        level: "Advanced",
        duration: 7200,
        thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        requirements: ["Basic medical knowledge", "Understanding of research methodology"],
        whatYouWillLearn: [
          "Clinical trial design and management",
          "Regulatory compliance and documentation",
          "Patient safety and ethical considerations",
          "Data management and analysis"
        ],
        skillsYouGain: [
          "Clinical Trial Management",
          "Regulatory Affairs",
          "ICH-GCP Guidelines",
          "Data Analysis"
        ],
        targetAudience: ["Medical students", "Research professionals", "Healthcare workers"],
        status: "published",
        isFeatured: true
      },
      {
        title: "Bioinformatics for Beginners",
        description: "Master the intersection of biology, computer science, and statistics to analyze biological data.",
        instructor: "Prof. Michael Chen",
        instructorId: new mongoose.Types.ObjectId(),
        price: 12499,
        discountedPrice: 9999,
        category: "Bioinformatics",
        level: "Intermediate",
        duration: 9600,
        thumbnail: "https://images.unsplash.com/photo-1581091226835-a8a0058f0a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        whatYouWillLearn: [
          "Genomic data analysis techniques",
          "Sequence alignment methods",
          "Protein structure prediction",
          "Statistical analysis of biological data"
        ],
        skillsYouGain: [
          "Genomic Analysis",
          "Sequence Alignment",
          "Molecular Modeling",
          "Data Visualization"
        ],
        targetAudience: ["Biology students", "Data scientists", "Research analysts"],
        status: "published",
        isFeatured: true
      },
      {
        title: "Medical Coding Certification",
        description: "Learn medical terminology, coding systems, and billing procedures for healthcare settings.",
        instructor: "Lisa Rodriguez, CPC",
        instructorId: new mongoose.Types.ObjectId(),
        price: 9999,
        discountedPrice: 7999,
        category: "Medical Coding",
        level: "Beginner",
        duration: 6000,
        thumbnail: "https://images.unsplash.com/photo-1576091160394-336b8d1b60c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        whatYouWillLearn: [
          "ICD-10 and CPT coding systems",
          "Medical billing procedures",
          "Healthcare compliance requirements",
          "Insurance claim processing"
        ],
        skillsYouGain: [
          "Medical Coding",
          "Healthcare Billing",
          "Compliance Management",
          "Insurance Processing"
        ],
        targetAudience: ["Healthcare administrators", "Medical students", "Career changers"],
        status: "published"
      },
      {
        title: "Pharmacovigilance and Drug Safety",
        description: "Specialized training in drug safety monitoring, adverse event reporting, and risk management.",
        instructor: "Dr. Robert Williams",
        instructorId: new mongoose.Types.ObjectId(),
        price: 14499,
        discountedPrice: 11999,
        category: "Pharmacovigilance",
        level: "Advanced",
        duration: 8400,
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        whatYouWillLearn: [
          "Adverse drug reaction monitoring",
          "Signal detection and management",
          "Risk-benefit assessment",
          "Regulatory reporting requirements"
        ],
        skillsYouGain: [
          "Drug Safety Monitoring",
          "Risk Management",
          "Regulatory Reporting",
          "Pharmacovigilance Systems"
        ],
        targetAudience: ["Pharmacists", "Clinical researchers", "Regulatory affairs professionals"],
        status: "published",
        isFeatured: true
      }
    ];

    // Clear existing courses
    await Course.deleteMany({});
    
    // Insert new demo courses
    const createdCourses = await Course.insertMany(demoCourses);
    
    console.log(`✅ Created ${createdCourses.length} demo courses`);
    
    res.json({ 
      message: 'Demo courses setup successfully', 
      courses: createdCourses.length 
    });
  } catch (error) {
    console.error("❌ Error setting up demo courses:", error);
    res.status(500).json({ error: "Failed to setup demo courses: " + error.message });
  }
});

// Get course analytics
router.get("/courses/:id/analytics", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const analytics = {
      enrollmentCount: course.enrollmentCount,
      completionCount: course.completionCount,
      completionRate: course.completionRate,
      averageRating: course.averageRating,
      ratingCount: course.ratingCount,
      activeStudents: course.activeStudentsCount,
      totalTimeSpent: course.totalTimeSpent
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course analytics" });
  }
});

// ==================== VIDEO ROUTES ====================

// Get all videos
router.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Get single video
router.get("/videos/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

// Upload video
router.post("/videos", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 Video upload request received");
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const video = new Video({
      title: req.body.title,
      course: req.body.course,
      description: req.body.description || "No description provided",
      url: `/uploads/${req.file.filename}`,
    });

    await video.save();
    
    console.log("✅ Video saved successfully:", video);
    res.json(video);

  } catch (error) {
    console.error("❌ Error saving video:", error);
    res.status(500).json({ error: "Failed to save video: " + error.message });
  }
});

// Update video
router.put("/videos/:id", upload.single("file"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      course: req.body.course,
      description: req.body.description
    };

    // If new file is uploaded, update the URL
    if (req.file) {
      updateData.url = `/uploads/${req.file.filename}`;
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Failed to update video" });
  }
});

// Delete video
router.delete("/videos/:id", async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete video" });
  }
});

// ==================== NOTE ROUTES ====================

// Get all notes
router.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Upload note
router.post("/notes", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File missing" });

    const note = new Note({
      title: req.body.title,
      course: req.body.course,
      url: `/uploads/${req.file.filename}`,
    });
    
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to save note" });
  }
});

// Update note
router.put("/notes/:id", upload.single("file"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      course: req.body.course
    };

    if (req.file) {
      updateData.url = `/uploads/${req.file.filename}`;
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete note
router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ==================== QUIZ ROUTES ====================

// Get all quizzes
router.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// Get single quiz
router.get("/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// Create quiz
router.post("/quizzes", async (req, res) => {
  try {
    const quiz = new Quiz({
      title: req.body.title,
      course: req.body.course,
      questions: req.body.questions || []
    });

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to create quiz" });
  }
});

// Update quiz
router.put("/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        course: req.body.course,
        questions: req.body.questions
      },
      { new: true }
    );

    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to update quiz" });
  }
});

// Delete quiz
router.delete("/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete quiz" });
  }
});

// ==================== STATS & OTHER ROUTES ====================

// Get admin stats
router.get("/stats", async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalCourses = await Course.countDocuments({ isActive: true });
    const publishedCourses = await Course.countDocuments({ status: "published", isActive: true });
    
    res.json({
      totalStudents: 0,
      totalFees: 0,
      totalCertificates: 0,
      totalNotes: totalNotes,
      totalQuizzes: totalQuizzes,
      totalVideos: totalVideos,
      totalCourses: totalCourses,
      publishedCourses: publishedCourses,
      activeStudents: 0,
      completionRate: 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Get chart data
router.get("/chart-data", async (req, res) => {
  try {
    // Get courses for chart data
    const courses = await Course.find({ isActive: true }).select('title');
    
    // Get unique courses from videos, notes, and quizzes
    const videoCourses = await Video.distinct("course");
    const noteCourses = await Note.distinct("course");
    const quizCourses = await Quiz.distinct("course");
    
    // Combine all unique courses
    const allCourses = [...new Set([...videoCourses, ...noteCourses, ...quizCourses])];
    
    // Count content per course
    const studentsPerCourse = await Promise.all(
      allCourses.map(async (course) => {
        const videoCount = await Video.countDocuments({ course });
        const noteCount = await Note.countDocuments({ course });
        const quizCount = await Quiz.countDocuments({ course });
        return videoCount + noteCount + quizCount;
      })
    );

    const notesPerCourse = await Promise.all(
      allCourses.map(async (course) => {
        return await Note.countDocuments({ course });
      })
    );

    const quizzesPerCourse = await Promise.all(
      allCourses.map(async (course) => {
        return await Quiz.countDocuments({ course });
      })
    );

    res.json({
      courses: allCourses,
      studentsPerCourse: studentsPerCourse,
      notesPerCourse: notesPerCourse,
      quizzesPerCourse: quizzesPerCourse,
      monthlyRevenue: [0, 0, 0, 0, 0, 0],
      monthlyStudents: [0, 0, 0, 0, 0, 0],
      engagementRate: [0, 0, 0, 0, 0, 0]
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.json({
      courses: [],
      studentsPerCourse: [],
      notesPerCourse: [],
      quizzesPerCourse: [],
      monthlyRevenue: [],
      monthlyStudents: [],
      engagementRate: []
    });
  }
});

// Student routes (placeholder)
router.get("/students", async (req, res) => {
  res.json([]);
});

router.get("/student-progress", async (req, res) => {
  res.json([]);
});

router.get("/feedbacks", async (req, res) => {
  res.json([]);
});

export default router;