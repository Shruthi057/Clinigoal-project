import express from "express";
import multer from "multer";
import Video from "../models/Video.js";
import Note from "../models/Note.js";
import Quiz from "../models/Quiz.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

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
    
    res.json({
      totalStudents: 0,
      totalFees: 0,
      totalCertificates: 0,
      totalNotes: totalNotes,
      totalQuizzes: totalQuizzes,
      totalVideos: totalVideos,
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
