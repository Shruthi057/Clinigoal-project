import React, { useEffect, useState } from "react";
import axios from "axios";
import "./admindashboard.css";
import { getUserStatistics, getUserLoginLogs, getTimeAgo, getUniqueUsersCount } from "../../utils/userTracking";

// Import Chart.js for charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Available instructors for dynamic selection
const availableInstructors = [
  "Dr. Ananya Sharma",
  "Prof. Rajiv Menon", 
  "Ms. Priya Nair",
  "Dr. Vikram Patel",
  "Dr. Sanjay Kumar",
  "Prof. Meera Desai",
  "Dr. Rohan Mehra",
  "Ms. Anjali Joshi"
];

// Safe date formatting function
const formatDate = (dateString) => {
  if (!dateString || dateString === 'undefined' || dateString === 'null') {
    return 'N/A';
  }
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  } catch (error) {
    return 'N/A';
  }
};

// Safe number formatting function
const formatNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) {
    return '0';
  }
  return number.toLocaleString("en-IN");
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFees: 0,
    totalCertificates: 0,
    totalNotes: 0,
    totalQuizzes: 0,
    totalVideos: 0,
    activeStudents: 0,
    completionRate: 0
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [chartData, setChartData] = useState({
    courses: [],
    studentsPerCourse: [],
    notesPerCourse: [],
    quizzesPerCourse: [],
  });

  // Course Management State
  const [showCourseSidebar, setShowCourseSidebar] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    instructor: "",
    duration: "",
    level: "Beginner",
    price: "₹9,999",
    image: "",
    features: [""],
    category: "General"
  });
  const [editingCourseId, setEditingCourseId] = useState(null);

  // Video states
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCourse, setVideoCourse] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoDescription, setVideoDescription] = useState("");

  // Note states
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCourse, setNoteCourse] = useState("");
  const [noteFile, setNoteFile] = useState(null);

  // Quiz states
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCourse, setQuizCourse] = useState("");
  const [questions, setQuestions] = useState([{ 
    id: Date.now(), 
    text: '', 
    options: [
      { id: Date.now() + 1, text: '', isCorrect: false },
      { id: Date.now() + 2, text: '', isCorrect: false }
    ] 
  }]);
  const [viewingQuiz, setViewingQuiz] = useState(null);

  // Uploaded items
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Student tracking
  const [students, setStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // User tracking states
  const [userLogs, setUserLogs] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    uniqueUsers: 0,
    todayLogins: 0,
    totalLogins: 0
  });

  // Student Reviews State
  const [studentReviews, setStudentReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Payment Details State
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFilters, setPaymentFilters] = useState({
    paymentMethod: 'all',
    search: ''
  });

  // Certificate Stats
  const [certificateStats, setCertificateStats] = useState({
    totalIssued: 0,
    byCourse: {},
    recentCertificates: []
  });

  // For editing
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [reviewFilters, setReviewFilters] = useState({
    course: 'all',
    rating: 'all',
    search: '',
    hasReply: 'all'
  });

  // Approval System State
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedEnrollments, setApprovedEnrollments] = useState([]);
  const [rejectedEnrollments, setRejectedEnrollments] = useState([]);
  const [showApprovalSidebar, setShowApprovalSidebar] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [approvalStats, setApprovalStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // ========== PROGRESS TRACKING STATE ==========
  const [studentProgress, setStudentProgress] = useState([]);
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);
  const [progressStats, setProgressStats] = useState({
    totalStudents: 0,
    totalEnrollments: 0,
    totalCompletedCourses: 0,
    averageProgress: 0
  });

  // ========== COURSE MANAGEMENT FUNCTIONS ==========

  // Load courses from localStorage
  const loadCourses = () => {
    try {
      const savedCourses = localStorage.getItem('clinigoalCourses');
      if (savedCourses) {
        const parsedCourses = JSON.parse(savedCourses);
        console.log("📚 Loaded courses from localStorage:", parsedCourses.length);
        setCourses(parsedCourses);
        return parsedCourses;
      } else {
        // Initialize with empty array if no courses exist
        console.log("📚 No courses found in localStorage, initializing empty array");
        setCourses([]);
        return [];
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
      return [];
    }
  };

  // Save courses to localStorage
  const saveCourses = (updatedCourses) => {
    try {
      localStorage.setItem('clinigoalCourses', JSON.stringify(updatedCourses));
      console.log("💾 Courses saved to localStorage:", updatedCourses.length);
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Error saving courses:', error);
    }
  };

  const handleCourseFormChange = (field, value) => {
    setCourseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...courseForm.features];
    updatedFeatures[index] = value;
    setCourseForm(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  const addFeatureField = () => {
    setCourseForm(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeatureField = (index) => {
    if (courseForm.features.length > 1) {
      const updatedFeatures = courseForm.features.filter((_, i) => i !== index);
      setCourseForm(prev => ({
        ...prev,
        features: updatedFeatures
      }));
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    if (!courseForm.title || !courseForm.description || !courseForm.instructor) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const courseData = {
        ...courseForm,
        features: courseForm.features.filter(feature => feature.trim() !== "")
      };

      let updatedCourses;

      if (editingCourseId) {
        // Update existing course
        updatedCourses = courses.map(course => 
          course._id === editingCourseId 
            ? { ...course, ...courseData }
            : course
        );
        alert("Course updated successfully!");
      } else {
        // Add new course
        const newCourse = {
          _id: `course_${Date.now()}`,
          ...courseData,
          createdAt: new Date().toISOString()
        };
        updatedCourses = [newCourse, ...courses];
        alert("Course added successfully!");
      }

      // Save to localStorage
      saveCourses(updatedCourses);

      // Reset form
      setCourseForm({
        title: "",
        description: "",
        instructor: "",
        duration: "",
        level: "Beginner",
        price: "₹9,999",
        image: "",
        features: [""],
        category: "General"
      });
      setEditingCourseId(null);
      setShowCourseSidebar(false);

    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course. Please try again.");
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      instructor: course.instructor || "",
      duration: course.duration || "",
      level: course.level || "Beginner",
      price: course.price || "₹9,999",
      image: course.image || "",
      features: course.features && course.features.length > 0 ? course.features : [""],
      category: course.category || "General"
    });
    setEditingCourseId(course._id);
    setShowCourseSidebar(true);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      const updatedCourses = courses.filter(course => course._id !== courseId);
      saveCourses(updatedCourses);
      alert("Course deleted successfully!");
    }
  };

  const handleCancelCourseEdit = () => {
    setCourseForm({
      title: "",
      description: "",
      instructor: "",
      duration: "",
      level: "Beginner",
      price: "₹9,999",
      image: "",
      features: [""],
      category: "General"
    });
    setEditingCourseId(null);
    setShowCourseSidebar(false);
  };

  // ========== COURSE SIDEBAR COMPONENT ==========

  const renderCourseSidebar = () => {
    if (!showCourseSidebar) return null;

    return (
      <div className="admin-course-sidebar">
        <div className="course-sidebar-header">
          <div className="course-header-content">
            <h3>{editingCourseId ? 'Edit Course' : 'Add New Course'}</h3>
          </div>
          <button 
            className="course-sidebar-close"
            onClick={handleCancelCourseEdit}
          >
            ×
          </button>
        </div>

        <div className="course-sidebar-content">
          <form onSubmit={handleAddCourse} className="course-form">
            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => handleCourseFormChange('title', e.target.value)}
                required
                placeholder="Enter course title"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => handleCourseFormChange('description', e.target.value)}
                required
                rows="3"
                placeholder="Enter course description"
              />
            </div>

            <div className="form-group">
              <label>Instructor *</label>
              <select
                value={courseForm.instructor}
                onChange={(e) => handleCourseFormChange('instructor', e.target.value)}
                required
              >
                <option value="">Select Instructor</option>
                {availableInstructors.map((instructor, index) => (
                  <option key={index} value={instructor}>
                    {instructor}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => handleCourseFormChange('duration', e.target.value)}
                  placeholder="e.g., 12 weeks"
                />
              </div>

              <div className="form-group">
                <label>Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => handleCourseFormChange('level', e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Course Price</label>
              <input
                type="text"
                value={courseForm.price}
                onChange={(e) => handleCourseFormChange('price', e.target.value)}
                placeholder="e.g., ₹9,999"
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                value={courseForm.image}
                onChange={(e) => handleCourseFormChange('image', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={courseForm.category}
                onChange={(e) => handleCourseFormChange('category', e.target.value)}
                placeholder="e.g., Clinical Research"
              />
            </div>

            <div className="form-group">
              <label>Course Features</label>
              {courseForm.features.map((feature, index) => (
                <div key={index} className="feature-input-group">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                  />
                  {courseForm.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeatureField(index)}
                      className="remove-feature-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeatureField}
                className="add-feature-btn"
              >
                + Add Feature
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="admin-btn primary">
                {editingCourseId ? 'Update Course' : 'Add Course'}
              </button>
              <button 
                type="button" 
                className="admin-btn secondary"
                onClick={handleCancelCourseEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ========== COURSE MANAGEMENT COMPONENT ==========

  const renderCourseManagement = () => {
    return (
      <div className="admin-course-management">
        <div className="admin-page-header">
          <div className="admin-page-header-left">
            <h1 className="admin-page-title">Course Management</h1>
            <p>Manage all courses in the platform - Changes sync automatically to user dashboard</p>
          </div>
          <div className="admin-page-actions">
            <button 
              className="admin-btn primary"
              onClick={() => setShowCourseSidebar(true)}
            >
              + Add New Course
            </button>
            <button 
              className="admin-btn secondary"
              onClick={loadCourses}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card primary">
            <div className="admin-stat-icon">📚</div>
            <div className="admin-stat-content">
              <h3>{courses.length}</h3>
              <p>Total Courses</p>
              <span className="admin-stat-change positive">Available in user dashboard</span>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="admin-stat-icon">👨‍🏫</div>
            <div className="admin-stat-content">
              <h3>{new Set(courses.map(course => course.instructor)).size}</h3>
              <p>Active Instructors</p>
              <span className="admin-stat-change positive">Teaching staff</span>
            </div>
          </div>
          <div className="admin-stat-card warning">
            <div className="admin-stat-icon">🎯</div>
            <div className="admin-stat-content">
              <h3>{courses.filter(course => course.level === 'Advanced').length}</h3>
              <p>Advanced Courses</p>
              <span className="admin-stat-change positive">Expert level</span>
            </div>
          </div>
          <div className="admin-stat-card info">
            <div className="admin-stat-icon">⏱️</div>
            <div className="admin-stat-content">
              <h3>{courses.reduce((acc, course) => {
                const duration = parseInt(course.duration) || 0;
                return acc + duration;
              }, 0)}</h3>
              <p>Total Weeks</p>
              <span className="admin-stat-change positive">Combined duration</span>
            </div>
          </div>
        </div>

        <div className="admin-courses-grid">
          {courses.map(course => (
            <div key={course._id} className="admin-course-card">
              <div className="course-card-header">
                <div className="course-image">
                  {course.image ? (
                    <img src={course.image} alt={course.title} />
                  ) : (
                    <div className="course-image-placeholder">📚</div>
                  )}
                </div>
                <div className="course-basic-info">
                  <h3>{course.title}</h3>
                  <p className="course-instructor">👨‍🏫 {course.instructor}</p>
                  <div className="course-meta">
                    <span className="course-duration">⏱️ {course.duration}</span>
                    <span className={`course-level ${course.level?.toLowerCase()}`}>
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="course-description">
                <p>{course.description}</p>
              </div>

              {course.features && course.features.length > 0 && (
                <div className="course-features">
                  <h4>Key Features:</h4>
                  <ul>
                    {course.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                    {course.features.length > 3 && (
                      <li>+ {course.features.length - 3} more features</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="course-price-section">
                <div className="course-price-display">
                  <span className="price-label">Course Price:</span>
                  <span className="course-price">{course.price}</span>
                </div>
              </div>

              <div className="course-actions">
                <button 
                  onClick={() => handleEditCourse(course)}
                  className="admin-btn action primary"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course._id)}
                  className="admin-btn action danger"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="admin-empty-message">
            <div className="admin-empty-icon">📚</div>
            <h3>No Courses Available</h3>
            <p>Get started by adding your first course using the "Add New Course" button.</p>
            <p>Courses added here will automatically appear in the user dashboard.</p>
          </div>
        )}
      </div>
    );
  };

  // ========== PROGRESS TRACKING FUNCTIONS ==========

  const fetchStudentProgress = () => {
    try {
      console.log("🔄 Fetching realistic student progress data...");
      
      const progressData = [];
      
      // Get all unique users from localStorage
      const uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
      const userLoginLogs = JSON.parse(localStorage.getItem('userLoginLogs') || '[]');
      const allCourses = JSON.parse(localStorage.getItem('clinigoalCourses') || '[]');
      
      // Get all user enrollments and progress data
      uniqueUsers.forEach((userEmail, index) => {
        const userKey = `userCourseAccess_${userEmail.replace(/[@.]/g, '_')}`;
        const userAccessData = JSON.parse(localStorage.getItem(userKey) || '{}');
        
        const userLog = Array.isArray(userLoginLogs) ? 
          userLoginLogs.find(log => log && log.email === userEmail) : null;
        
        // Get user's watched videos, completed notes, and quizzes
        const userWatchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        const userCompletedNotes = JSON.parse(localStorage.getItem('completedNotes') || '[]');
        const userCompletedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        
        // Get user's certificates
        const userCertificates = JSON.parse(localStorage.getItem('userCertificates') || '[]');
        
        // Process each course the user has access to
        Object.entries(userAccessData).forEach(([courseId, accessInfo]) => {
          if (accessInfo.status === 'approved') {
            const course = allCourses.find(c => c._id === courseId);
            if (course) {
              // Calculate realistic progress based on actual user activity
              const courseProgress = calculateRealCourseProgress(
                courseId, 
                userWatchedVideos, 
                userCompletedNotes, 
                userCompletedQuizzes
              );
              
              const userCertificate = userCertificates.find(cert => 
                cert.courseId === courseId && cert.studentEmail === userEmail
              );
              
              const progressEntry = {
                id: `progress_${userEmail}_${courseId}`,
                userId: `user_${index + 1}`,
                userName: userLog?.name || userEmail.split('@')[0],
                userEmail: userEmail,
                enrolledCourse: course.title,
                courseId: courseId,
                progress: courseProgress.moduleProgress,
                overallProgress: courseProgress.overallProgress,
                lastLogin: userLog?.timestamp ? new Date(userLog.timestamp).toLocaleDateString() : 'Never',
                certificates: userCertificate ? '✅ Certificate Generated' : '❌ Not Yet Generated',
                enrollmentDate: accessInfo.updatedAt ? new Date(accessInfo.updatedAt).toLocaleDateString() : 'Unknown',
                lastActivity: getLastUserActivity(userEmail, courseId),
                timeSpent: calculateTimeSpent(userEmail, courseId),
                completedModules: courseProgress.completedModules,
                totalModules: courseProgress.totalModules
              };
              
              progressData.push(progressEntry);
            }
          }
        });
      });

      console.log("📊 Realistic student progress data:", progressData);
      setStudentProgress(progressData);

      // Calculate progress statistics from real data
      const totalStudents = new Set(progressData.map(p => p.userEmail)).size;
      const totalEnrollments = progressData.length;
      const totalCompletedCourses = progressData.filter(student => student.overallProgress === 100).length;
      const averageProgress = progressData.length > 0 
        ? Math.round(progressData.reduce((sum, student) => sum + student.overallProgress, 0) / progressData.length)
        : 0;

      setProgressStats({
        totalStudents,
        totalEnrollments,
        totalCompletedCourses,
        averageProgress
      });

    } catch (error) {
      console.error("❌ Error fetching student progress:", error);
      setStudentProgress([]);
      setProgressStats({
        totalStudents: 0,
        totalEnrollments: 0,
        totalCompletedCourses: 0,
        averageProgress: 0
      });
    }
  };

  // Calculate realistic course progress based on user activity
  const calculateRealCourseProgress = (courseId, watchedVideos, completedNotes, completedQuizzes) => {
    // For demo purposes, create module structure
    const modules = [
      'Module 1: Introduction',
      'Module 2: Core Concepts', 
      'Module 3: Advanced Topics',
      'Module 4: Practical Applications',
      'Module 5: Assessment'
    ];
    
    const moduleProgress = {};
    let completedModules = 0;
    
    // Calculate progress for each module
    modules.forEach((module, index) => {
      const moduleCompletion = calculateModuleCompletion(
        module, 
        courseId, 
        watchedVideos, 
        completedNotes, 
        completedQuizzes,
        index
      );
      
      moduleProgress[module] = moduleCompletion.status;
      
      if (moduleCompletion.status === '✅ Completed') {
        completedModules++;
      }
    });
    
    const overallProgress = Math.round((completedModules / modules.length) * 100);
    
    return {
      moduleProgress,
      overallProgress,
      completedModules,
      totalModules: modules.length
    };
  };

  const calculateModuleCompletion = (module, courseId, watchedVideos, completedNotes, completedQuizzes, moduleIndex) => {
    // Simulate realistic module completion based on user activity
    // In a real app, this would check actual course content completion
    const hasActivity = 
      watchedVideos.length > moduleIndex || 
      completedNotes.length > moduleIndex || 
      completedQuizzes.length > moduleIndex;
    
    const isCompleted = 
      watchedVideos.length > moduleIndex + 2 && 
      completedNotes.length > moduleIndex + 1 && 
      completedQuizzes.length > moduleIndex;
    
    let status;
    if (isCompleted) {
      status = '✅ Completed';
    } else if (hasActivity) {
      status = '⏳ In Progress';
    } else {
      status = '❌ Not Started';
    }
    
    return { status };
  };

  const getLastUserActivity = (userEmail, courseId) => {
    try {
      // Get user's last activity from various sources
      const userLoginLogs = JSON.parse(localStorage.getItem('userLoginLogs') || '[]');
      const userLog = userLoginLogs
        .filter(log => log && log.email === userEmail)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      
      if (userLog) {
        return new Date(userLog.timestamp).toLocaleDateString();
      }
      
      return 'No recent activity';
    } catch (error) {
      return 'Unknown';
    }
  };

  const calculateTimeSpent = (userEmail, courseId) => {
    // Calculate estimated time spent based on activities
    const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
    const completedNotes = JSON.parse(localStorage.getItem('completedNotes') || '[]');
    const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
    
    // Estimate time based on completed items
    const videoTime = watchedVideos.length * 30; // 30 minutes per video
    const noteTime = completedNotes.length * 45; // 45 minutes per note
    const quizTime = completedQuizzes.length * 20; // 20 minutes per quiz
    
    const totalMinutes = videoTime + noteTime + quizTime;
    
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const viewStudentProgressDetails = (student) => {
    setSelectedStudentProgress(student);
  };

  const closeStudentProgressDetails = () => {
    setSelectedStudentProgress(null);
  };

  const getProgressIcon = (status) => {
    switch (status) {
      case '✅ Completed': return '✅';
      case '⏳ In Progress': return '⏳';
      case '❌ Not Started': return '❌';
      default: return '❌';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case '✅ Completed': return '#10b981';
      case '⏳ In Progress': return '#f59e0b';
      case '❌ Not Started': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Function to manually update student progress (for admin actions)
  const updateStudentProgress = (studentEmail, courseId, updates) => {
    try {
      const userKey = `userCourseAccess_${studentEmail.replace(/[@.]/g, '_')}`;
      const userAccessData = JSON.parse(localStorage.getItem(userKey) || '{}');
      
      if (userAccessData[courseId]) {
        userAccessData[courseId] = {
          ...userAccessData[courseId],
          ...updates,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin'
        };
        
        localStorage.setItem(userKey, JSON.stringify(userAccessData));
        
        // Refresh progress data
        fetchStudentProgress();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating student progress:', error);
      return false;
    }
  };

  // Function to generate certificate for student
  const generateCertificateForStudent = (studentEmail, courseId) => {
    try {
      const userCertificates = JSON.parse(localStorage.getItem('userCertificates') || '[]');
      const course = courses.find(c => c._id === courseId);
      const student = studentProgress.find(s => s.userEmail === studentEmail && s.courseId === courseId);
      
      if (course && student) {
        const certificate = {
          _id: `cert_${studentEmail}_${courseId}_${Date.now()}`,
          courseId: courseId,
          courseTitle: course.title,
          studentName: student.userName,
          studentEmail: studentEmail,
          issueDate: new Date().toISOString(),
          certificateId: `CLG-${courseId}-${Date.now().toString().slice(-6)}`,
          instructor: course.instructor,
          duration: course.duration,
          generatedBy: 'Admin'
        };
        
        userCertificates.push(certificate);
        localStorage.setItem('userCertificates', JSON.stringify(userCertificates));
        
        // Update student progress
        updateStudentProgress(studentEmail, courseId, {
          certificateGenerated: true,
          certificateId: certificate.certificateId
        });
        
        return certificate;
      }
      return null;
    } catch (error) {
      console.error('Error generating certificate:', error);
      return null;
    }
  };

  // ========== PROGRESS TRACKING COMPONENT ==========

  const renderProgressTracking = () => {
    return (
      <div className="admin-progress-tracking">
        <div className="admin-page-header">
          <div className="admin-page-header-left">
            <h1 className="admin-page-title">Student Progress Tracking</h1>
            <p>Monitor real-time student learning progress and course completion</p>
            <div className="last-updated">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="admin-page-actions">
            <button className="admin-btn primary" onClick={fetchStudentProgress}>
              🔄 Refresh Progress
            </button>
            <button className="admin-btn secondary" onClick={() => setActiveTab('students')}>
              👥 View All Students
            </button>
            <button 
              className="admin-btn warning" 
              onClick={() => console.log('Export progress data')}
            >
              📊 Export Data
            </button>
          </div>
        </div>

        {/* Progress Statistics */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card primary">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-content">
              <h3>{progressStats.totalStudents}</h3>
              <p>Active Students</p>
              <span className="admin-stat-change positive">Currently learning</span>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="admin-stat-icon">📚</div>
            <div className="admin-stat-content">
              <h3>{progressStats.totalEnrollments}</h3>
              <p>Active Enrollments</p>
              <span className="admin-stat-change positive">Course enrollments</span>
            </div>
          </div>
          <div className="admin-stat-card warning">
            <div className="admin-stat-icon">🎯</div>
            <div className="admin-stat-content">
              <h3>{progressStats.averageProgress}%</h3>
              <p>Average Progress</p>
              <span className="admin-stat-change positive">Overall completion</span>
            </div>
          </div>
          <div className="admin-stat-card info">
            <div className="admin-stat-icon">🏆</div>
            <div className="admin-stat-content">
              <h3>{progressStats.totalCompletedCourses}</h3>
              <p>Completed Courses</p>
              <span className="admin-stat-change positive">Total completions</span>
            </div>
          </div>
        </div>

        {/* Student Progress List */}
        <div className="admin-progress-list">
          <div className="progress-list-header">
            <h3>📋 Student Progress Overview</h3>
            <div className="progress-summary">
              Showing {studentProgress.length} active enrollments
            </div>
          </div>
          
          <div className="progress-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search students or courses..."
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select className="filter-select">
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
              <select className="filter-select">
                <option value="all">All Progress</option>
                <option value="completed">Completed (100%)</option>
                <option value="in-progress">In Progress (1-99%)</option>
                <option value="not-started">Not Started (0%)</option>
              </select>
              <select className="filter-select">
                <option value="all">All Status</option>
                <option value="with-certificate">With Certificate</option>
                <option value="without-certificate">Without Certificate</option>
              </select>
            </div>
          </div>

          {studentProgress.length > 0 ? (
            <div className="progress-grid">
              {studentProgress.map((student, index) => (
                <div key={student.id || index} className="progress-card">
                  <div className="progress-card-header">
                    <div className="student-avatar">
                      {student.userName ? student.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="student-info">
                      <h4>👤 {student.userName}</h4>
                      <p>📧 {student.userEmail}</p>
                      <p>🎓 {student.enrolledCourse}</p>
                      <p className="enrollment-date">
                        📅 Enrolled: {student.enrollmentDate}
                      </p>
                    </div>
                    <div className="progress-badge">
                      <span className={`progress-percent ${student.overallProgress >= 80 ? 'high' : student.overallProgress >= 50 ? 'medium' : 'low'}`}>
                        {student.overallProgress}%
                      </span>
                      <div className="progress-meta">
                        <span>⏱️ {student.timeSpent || '0m'}</span>
                        <span>📅 {student.lastActivity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="progress-details">
                    <div className="module-progress-summary">
                      <h5>Module Progress:</h5>
                      <div className="modules-summary">
                        <span className="modules-completed">
                          {student.completedModules || 0}/{student.totalModules || 5} modules
                        </span>
                      </div>
                    </div>
                    <div className="module-progress">
                      {Object.entries(student.progress || {}).map(([module, status]) => (
                        <div key={module} className="module-item">
                          <span className="module-name">{module}:</span>
                          <span 
                            className="module-status"
                            style={{ color: getProgressColor(status) }}
                          >
                            {getProgressIcon(status)} {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="progress-footer">
                    <div className="progress-meta">
                      <span>📅 Last Login: {student.lastLogin}</span>
                      <span>📜 {student.certificates}</span>
                    </div>
                    <div className="progress-actions">
                      <button 
                        className="admin-btn action primary"
                        onClick={() => viewStudentProgressDetails(student)}
                      >
                        View Details
                      </button>
                      {student.overallProgress === 100 && student.certificates === '❌ Not Yet Generated' && (
                        <button 
                          className="admin-btn action success"
                          onClick={() => {
                            if (generateCertificateForStudent(student.userEmail, student.courseId)) {
                              alert(`Certificate generated for ${student.userName}`);
                              fetchStudentProgress();
                            }
                          }}
                        >
                          🎓 Generate Cert
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${student.overallProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      Overall Progress: {student.overallProgress}% • {student.completedModules || 0}/{student.totalModules || 5} modules
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-message">
              <div className="admin-empty-icon">📊</div>
              <h3>No Progress Data Available</h3>
              <p>Student progress data will appear here as users enroll in courses and make progress.</p>
              <p>Make sure students are actively using the platform and courses have been approved.</p>
              <div className="empty-actions">
                <button className="admin-btn primary" onClick={fetchStudentProgress}>
                  🔄 Load Current Data
                </button>
                <button 
                  className="admin-btn secondary" 
                  onClick={() => setActiveTab('approvals')}
                >
                  📋 Check Enrollment Approvals
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Course-wise Progress Summary */}
        <div className="course-progress-summary">
          <h3>🎯 Course-wise Progress Summary</h3>
          <div className="course-progress-cards">
            {courses.map(course => {
              const courseStudents = studentProgress.filter(student => student.courseId === course._id);
              const totalStudents = courseStudents.length;
              const averageProgress = totalStudents > 0 
                ? Math.round(courseStudents.reduce((sum, student) => sum + student.overallProgress, 0) / totalStudents)
                : 0;
              const completedStudents = courseStudents.filter(student => student.overallProgress === 100).length;
              const activeStudents = courseStudents.filter(student => student.overallProgress > 0 && student.overallProgress < 100).length;

              return (
                <div key={course._id} className="course-progress-card">
                  <div className="course-progress-header">
                    <h4>{course.title}</h4>
                    <span className="course-level">{course.level}</span>
                  </div>
                  <div className="course-progress-stats">
                    <div className="course-stat">
                      <span className="stat-value">{totalStudents}</span>
                      <span className="stat-label">Students</span>
                    </div>
                    <div className="course-stat">
                      <span className="stat-value">{averageProgress}%</span>
                      <span className="stat-label">Avg Progress</span>
                    </div>
                    <div className="course-stat">
                      <span className="stat-value">{completedStudents}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                  </div>
                  <div className="course-progress-bar">
                    <div 
                      className="course-progress-fill"
                      style={{ width: `${averageProgress}%` }}
                    ></div>
                  </div>
                  <div className="course-student-breakdown">
                    <div className="breakdown-item completed">
                      <span className="breakdown-dot"></span>
                      Completed: {completedStudents}
                    </div>
                    <div className="breakdown-item in-progress">
                      <span className="breakdown-dot"></span>
                      In Progress: {activeStudents}
                    </div>
                    <div className="breakdown-item not-started">
                      <span className="breakdown-dot"></span>
                      Not Started: {totalStudents - completedStudents - activeStudents}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ========== STUDENT PROGRESS DETAILS MODAL ==========

  const renderStudentProgressDetails = () => {
    if (!selectedStudentProgress) return null;

    const student = selectedStudentProgress;

    return (
      <div className="admin-modal-overlay">
        <div className="admin-modal large">
          <div className="admin-modal-header">
            <h2>Student Progress Details</h2>
            <button 
              className="admin-modal-close" 
              onClick={closeStudentProgressDetails}
            >
              ×
            </button>
          </div>
          
          <div className="admin-modal-content">
            <div className="student-progress-header">
              <div className="student-avatar large">
                {student.userName ? student.userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="student-basic-info">
                <h3>👤 {student.userName}</h3>
                <p>📧 {student.userEmail}</p>
                <p>🎓 Course: {student.enrolledCourse}</p>
                <p>📅 Enrollment Date: {student.enrollmentDate}</p>
                <p>📅 Last Login: {student.lastLogin}</p>
                <p>⏱️ Time Spent: {student.timeSpent || 'Not tracked'}</p>
                <p>📜 Certificate: {student.certificates}</p>
              </div>
              <div className="overall-progress-display">
                <div className="progress-circle">
                  <span className="progress-percent">{student.overallProgress}%</span>
                </div>
                <p>Overall Progress</p>
                <div className="modules-completed">
                  {student.completedModules || 0}/{student.totalModules || 5} modules
                </div>
              </div>
            </div>

            <div className="detailed-progress-section">
              <h4>Module-wise Progress</h4>
              <div className="module-progress-detailed">
                {Object.entries(student.progress || {}).map(([module, status]) => (
                  <div key={module} className="module-progress-item">
                    <div className="module-info">
                      <span className="module-name">{module}</span>
                      <span 
                        className="module-status"
                        style={{ color: getProgressColor(status) }}
                      >
                        {getProgressIcon(status)} {status}
                      </span>
                    </div>
                    <div className="module-progress-bar">
                      <div 
                        className="module-progress-fill"
                        style={{ 
                          width: status === '✅ Completed' ? '100%' : 
                                 status === '⏳ In Progress' ? '50%' : '0%',
                          backgroundColor: getProgressColor(status)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="progress-activity">
              <h4>Recent Activity</h4>
              <div className="activity-timeline">
                <div className="activity-item">
                  <div className="activity-icon">📚</div>
                  <div className="activity-content">
                    <strong>Last Course Activity</strong>
                    <span>Progress updated to {student.overallProgress}%</span>
                    <span className="activity-time">{student.lastActivity}</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🔔</div>
                  <div className="activity-content">
                    <strong>Platform Access</strong>
                    <span>Last login to platform</span>
                    <span className="activity-time">{student.lastLogin}</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🎓</div>
                  <div className="activity-content">
                    <strong>Course Enrollment</strong>
                    <span>Joined {student.enrolledCourse}</span>
                    <span className="activity-time">{student.enrollmentDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions Section */}
            <div className="admin-actions-section">
              <h4>Admin Actions</h4>
              <div className="action-buttons-grid">
                <button 
                  className="admin-btn primary"
                  onClick={() => {
                    // Send message/email to student
                    const message = prompt(`Send message to ${student.userName}:`, "Great progress! Keep up the good work!");
                    if (message) {
                      alert(`Message sent to ${student.userName}`);
                    }
                  }}
                >
                  📧 Send Message
                </button>
                <button 
                  className="admin-btn success"
                  onClick={() => {
                    if (student.overallProgress === 100 && student.certificates === '❌ Not Yet Generated') {
                      if (generateCertificateForStudent(student.userEmail, student.courseId)) {
                        alert(`Certificate generated for ${student.userName}`);
                        closeStudentProgressDetails();
                        fetchStudentProgress();
                      }
                    } else {
                      alert('Certificate can only be generated for completed courses (100% progress)');
                    }
                  }}
                  disabled={student.overallProgress !== 100 || student.certificates === '✅ Certificate Generated'}
                >
                  🎓 Generate Certificate
                </button>
                <button 
                  className="admin-btn warning"
                  onClick={() => {
                    const note = prompt(`Add admin note for ${student.userName}:`);
                    if (note) {
                      // Save admin note
                      alert('Note added successfully');
                    }
                  }}
                >
                  📝 Add Note
                </button>
              </div>
            </div>
          </div>
          
          <div className="admin-modal-actions">
            <button 
              onClick={closeStudentProgressDetails}
              className="admin-btn secondary"
            >
              Close
            </button>
            <button 
              className="admin-btn primary"
              onClick={() => {
                // View full student profile
                alert(`Viewing full profile for ${student.userName}`);
              }}
            >
              👤 View Full Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== APPROVAL SYSTEM FUNCTIONS ==========

  const fetchPendingApprovals = () => {
    try {
      console.log("🔄 Fetching pending approvals from user dashboard...");
      
      const allEnrollments = JSON.parse(localStorage.getItem('allEnrollments') || '[]');
      const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
      const adminApprovals = JSON.parse(localStorage.getItem('adminApprovals') || '{}');
      const courseEnrollments = JSON.parse(localStorage.getItem('courseEnrollments') || '[]');

      const allPending = [
        ...(Array.isArray(allEnrollments) ? allEnrollments.filter(e => e && e.status === 'pending') : []),
        ...(Array.isArray(pendingEnrollments) ? pendingEnrollments : []),
        ...(Array.isArray(adminApprovals.pending) ? adminApprovals.pending : []),
        ...(Array.isArray(courseEnrollments) ? courseEnrollments.filter(e => e && e.status === 'pending') : [])
      ].filter((enrollment, index, array) => 
        enrollment && array.findIndex(e => e.id === enrollment.id) === index
      );

      console.log("⏳ Final pending approvals:", allPending.length);
      setPendingApprovals(allPending);

      const approved = Array.isArray(adminApprovals.approved) ? adminApprovals.approved : [];
      const rejected = Array.isArray(adminApprovals.rejected) ? adminApprovals.rejected : [];

      setApprovedEnrollments(approved);
      setRejectedEnrollments(rejected);

      setApprovalStats({
        pending: allPending.length,
        approved: approved.length,
        rejected: rejected.length,
        total: allPending.length + approved.length + rejected.length
      });

    } catch (error) {
      console.error("❌ Error fetching pending approvals:", error);
      setPendingApprovals([]);
      setApprovedEnrollments([]);
      setRejectedEnrollments([]);
    }
  };

  const updateUserDashboardOnApproval = (userEmail, courseId) => {
    try {
      console.log(`✅ Granting access to ${userEmail} for course ${courseId}`);
      
      const userAccessKey = `userCourseAccess_${userEmail.replace(/[@.]/g, '_')}`;
      const userAccessData = JSON.parse(localStorage.getItem(userAccessKey) || '{}');
      
      userAccessData[courseId] = {
        status: 'approved',
        updatedAt: new Date().toISOString(),
        canAccess: true,
        approvedBy: 'Admin',
        approvedAt: new Date().toISOString()
      };
      
      localStorage.setItem(userAccessKey, JSON.stringify(userAccessData));
      
      console.log(`✅ Successfully updated ${userEmail}'s dashboard with access to course ${courseId}`);
    } catch (error) {
      console.error("❌ Error updating user dashboard:", error);
    }
  };

  const handleApproveEnrollment = (enrollment) => {
    if (!enrollment) return;
    
    if (window.confirm(`Approve enrollment for ${enrollment.studentName} in ${enrollment.courseTitle}?`)) {
      try {
        console.log("✅ Approving enrollment:", enrollment);

        const allEnrollments = JSON.parse(localStorage.getItem('allEnrollments') || '[]');
        const updatedAllEnrollments = allEnrollments.map(e => 
          e && e.id === enrollment.id ? { ...e, status: 'approved', approvedAt: new Date().toISOString() } : e
        );
        localStorage.setItem('allEnrollments', JSON.stringify(updatedAllEnrollments));

        const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
        const updatedPending = pendingEnrollments.filter(e => e && e.id !== enrollment.id);
        localStorage.setItem('pendingEnrollments', JSON.stringify(updatedPending));

        const adminApprovals = JSON.parse(localStorage.getItem('adminApprovals') || '{}');
        const approved = Array.isArray(adminApprovals.approved) ? adminApprovals.approved : [];
        const updatedApproved = [...approved, { 
          ...enrollment, 
          status: 'approved', 
          approvedAt: new Date().toISOString(),
          approvedBy: 'Admin'
        }];
        
        localStorage.setItem('adminApprovals', JSON.stringify({
          ...adminApprovals,
          approved: updatedApproved,
          pending: updatedPending
        }));

        const courseEnrollments = JSON.parse(localStorage.getItem('courseEnrollments') || '[]');
        const updatedCourseEnrollments = courseEnrollments.map(e => 
          e && e.id === enrollment.id ? { ...e, status: 'approved' } : e
        );
        localStorage.setItem('courseEnrollments', JSON.stringify(updatedCourseEnrollments));

        updateUserDashboardOnApproval(enrollment.studentEmail, enrollment.courseId);

        setPendingApprovals(updatedPending);
        setApprovedEnrollments(updatedApproved);

        setApprovalStats(prev => ({
          ...prev,
          pending: updatedPending.length,
          approved: updatedApproved.length
        }));

        alert(`✅ Enrollment approved successfully! ${enrollment.studentName} can now access the course.`);

      } catch (error) {
        console.error("❌ Error approving enrollment:", error);
        alert("❌ Failed to approve enrollment. Please try again.");
      }
    }
  };

  const handleRejectEnrollment = (enrollment) => {
    if (!enrollment) return;
    
    const reason = prompt(`Please provide a reason for rejecting ${enrollment.studentName}'s enrollment in ${enrollment.courseTitle}:`, "Course requirements not met");
    
    if (reason !== null) {
      try {
        console.log("❌ Rejecting enrollment:", enrollment);

        const allEnrollments = JSON.parse(localStorage.getItem('allEnrollments') || '[]');
        const updatedAllEnrollments = allEnrollments.map(e => 
          e && e.id === enrollment.id ? { ...e, status: 'rejected', rejectedAt: new Date().toISOString() } : e
        );
        localStorage.setItem('allEnrollments', JSON.stringify(updatedAllEnrollments));

        const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
        const updatedPending = pendingEnrollments.filter(e => e && e.id !== enrollment.id);
        localStorage.setItem('pendingEnrollments', JSON.stringify(updatedPending));

        const adminApprovals = JSON.parse(localStorage.getItem('adminApprovals') || '{}');
        const rejected = Array.isArray(adminApprovals.rejected) ? adminApprovals.rejected : [];
        const updatedRejected = [...rejected, { 
          ...enrollment, 
          status: 'rejected', 
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
          rejectedBy: 'Admin'
        }];
        
        localStorage.setItem('adminApprovals', JSON.stringify({
          ...adminApprovals,
          rejected: updatedRejected,
          pending: updatedPending
        }));

        const courseEnrollments = JSON.parse(localStorage.getItem('courseEnrollments') || '[]');
        const updatedCourseEnrollments = courseEnrollments.map(e => 
          e && e.id === enrollment.id ? { ...e, status: 'rejected' } : e
        );
        localStorage.setItem('courseEnrollments', JSON.stringify(updatedCourseEnrollments));

        setPendingApprovals(updatedPending);
        setRejectedEnrollments(updatedRejected);

        setApprovalStats(prev => ({
          ...prev,
          pending: updatedPending.length,
          rejected: updatedRejected.length
        }));

        alert(`❌ Enrollment rejected. ${enrollment.studentName} has been notified.`);

      } catch (error) {
        console.error("❌ Error rejecting enrollment:", error);
        alert("❌ Failed to reject enrollment. Please try again.");
      }
    }
  };

  const handleBulkApprove = () => {
    if (pendingApprovals.length === 0) {
      alert("No pending enrollments to approve.");
      return;
    }

    if (window.confirm(`Approve all ${pendingApprovals.length} pending enrollments?`)) {
      try {
        const allEnrollments = JSON.parse(localStorage.getItem('allEnrollments') || '[]');
        const updatedAllEnrollments = allEnrollments.map(e => {
          const pendingEnrollment = pendingApprovals.find(p => p && p.id === e.id);
          if (pendingEnrollment) {
            return { ...e, status: 'approved', approvedAt: new Date().toISOString() };
          }
          return e;
        });
        localStorage.setItem('allEnrollments', JSON.stringify(updatedAllEnrollments));

        localStorage.setItem('pendingEnrollments', JSON.stringify([]));

        const adminApprovals = JSON.parse(localStorage.getItem('adminApprovals') || '{}');
        const approved = Array.isArray(adminApprovals.approved) ? adminApprovals.approved : [];
        const updatedApproved = [
          ...approved,
          ...pendingApprovals.map(app => ({
            ...app,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: 'Admin',
            bulkApproved: true
          }))
        ];

        localStorage.setItem('adminApprovals', JSON.stringify({
          ...adminApprovals,
          approved: updatedApproved,
          pending: []
        }));

        const courseEnrollments = JSON.parse(localStorage.getItem('courseEnrollments') || '[]');
        const updatedCourseEnrollments = courseEnrollments.map(e => {
          const pendingEnrollment = pendingApprovals.find(p => p && p.id === e.id);
          if (pendingEnrollment) {
            return { ...e, status: 'approved' };
          }
          return e;
        });
        localStorage.setItem('courseEnrollments', JSON.stringify(updatedCourseEnrollments));

        pendingApprovals.forEach(enrollment => {
          if (enrollment) {
            updateUserDashboardOnApproval(enrollment.studentEmail, enrollment.courseId);
          }
        });

        setApprovedEnrollments(updatedApproved);
        setPendingApprovals([]);

        setApprovalStats(prev => ({
          ...prev,
          pending: 0,
          approved: updatedApproved.length
        }));

        alert(`✅ Successfully approved ${pendingApprovals.length} enrollments!`);

      } catch (error) {
        console.error("❌ Error in bulk approval:", error);
        alert("❌ Failed to approve enrollments. Please try again.");
      }
    }
  };

  const debugEnrollmentStorage = () => {
    console.log("🐛 DEBUG - Enrollment Storage:");
    
    const allEnrollments = JSON.parse(localStorage.getItem('allEnrollments') || '[]');
    const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
    const adminApprovals = JSON.parse(localStorage.getItem('adminApprovals') || '{}');
    const courseEnrollments = JSON.parse(localStorage.getItem('courseEnrollments') || '[]');
    
    console.log("allEnrollments:", allEnrollments);
    console.log("pendingEnrollments:", pendingEnrollments);
    console.log("adminApprovals:", adminApprovals);
    console.log("courseEnrollments:", courseEnrollments);
    
    alert(`Enrollment Storage Debug:
All Enrollments: ${Array.isArray(allEnrollments) ? allEnrollments.length : 0}
Pending Enrollments: ${Array.isArray(pendingEnrollments) ? pendingEnrollments.length : 0}
Admin Approvals - Pending: ${Array.isArray(adminApprovals.pending) ? adminApprovals.pending.length : 0}
Admin Approvals - Approved: ${Array.isArray(adminApprovals.approved) ? adminApprovals.approved.length : 0}
Course Enrollments: ${Array.isArray(courseEnrollments) ? courseEnrollments.length : 0}
    `);
  };

  const handleViewEnrollmentDetails = (enrollment) => {
    if (enrollment) {
      setSelectedEnrollment(enrollment);
    }
  };

  const handleCloseEnrollmentDetails = () => {
    setSelectedEnrollment(null);
  };

  const renderApprovalSidebar = () => {
    if (!showApprovalSidebar) return null;

    return (
      <div className="admin-approval-sidebar">
        <div className="approval-sidebar-header">
          <div className="approval-header-content">
            <h3>Enrollment Approvals</h3>
            <div className="approval-stats-badge">
              <span className="pending-count">{approvalStats.pending}</span>
            </div>
          </div>
          <button 
            className="approval-sidebar-close"
            onClick={() => setShowApprovalSidebar(false)}
          >
            ×
          </button>
        </div>

        <div className="approval-sidebar-content">
          <div className="approval-quick-stats">
            <div className="approval-stat-item pending">
              <span className="stat-icon">⏳</span>
              <div className="stat-info">
                <span className="stat-count">{approvalStats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            <div className="approval-stat-item approved">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <span className="stat-count">{approvalStats.approved}</span>
                <span className="stat-label">Approved</span>
              </div>
            </div>
            <div className="approval-stat-item rejected">
              <span className="stat-icon">❌</span>
              <div className="stat-info">
                <span className="stat-count">{approvalStats.rejected}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
          </div>

          {pendingApprovals.length > 0 && (
            <div className="approval-bulk-actions">
              <button 
                className="admin-btn primary bulk-approve-btn"
                onClick={handleBulkApprove}
              >
                ✅ Approve All ({pendingApprovals.length})
              </button>
            </div>
          )}

          <div className="approval-list-section">
            <h4>Pending Approval ({pendingApprovals.length})</h4>
            {pendingApprovals.length > 0 ? (
              <div className="approval-list">
                {pendingApprovals.map((enrollment, index) => (
                  enrollment && (
                    <div key={enrollment.id || index} className="approval-item pending">
                      <div className="approval-item-header">
                        <div className="student-avatar">
                          {enrollment.studentName ? enrollment.studentName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="student-info">
                          <strong>{enrollment.studentName || 'Unknown Student'}</strong>
                          <span>{enrollment.studentEmail || 'No email'}</span>
                        </div>
                        <span className="approval-badge pending">Pending</span>
                      </div>
                      
                      <div className="course-info">
                        <strong>{enrollment.courseTitle || 'Unknown Course'}</strong>
                        <div className="enrollment-meta">
                          <span>Enrolled: {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'Unknown date'}</span>
                          <span>Payment: {enrollment.paymentAmount || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="approval-actions">
                        <button 
                          className="admin-btn success approve-btn"
                          onClick={() => handleApproveEnrollment(enrollment)}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="admin-btn danger reject-btn"
                          onClick={() => handleRejectEnrollment(enrollment)}
                        >
                          ❌ Reject
                        </button>
                        <button 
                          className="admin-btn secondary view-btn"
                          onClick={() => handleViewEnrollmentDetails(enrollment)}
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="approval-empty-state">
                <div className="empty-icon">🎉</div>
                <p>No pending approvals</p>
                <span>All enrollments have been processed</span>
              </div>
            )}
          </div>

          {(approvedEnrollments.length > 0 || rejectedEnrollments.length > 0) && (
            <div className="processed-section">
              <h4>Recently Processed</h4>
              <div className="processed-list">
                {[...approvedEnrollments.slice(-3), ...rejectedEnrollments.slice(-2)].map((enrollment, index) => (
                  enrollment && (
                    <div key={enrollment.id || index} className={`processed-item ${enrollment.status}`}>
                      <div className="processed-header">
                        <div className="student-avatar small">
                          {enrollment.studentName ? enrollment.studentName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="processed-info">
                          <strong>{enrollment.studentName || 'Unknown Student'}</strong>
                          <span>{enrollment.courseTitle || 'Unknown Course'}</span>
                        </div>
                        <span className={`status-badge ${enrollment.status}`}>
                          {enrollment.status === 'approved' ? '✅' : '❌'}
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEnrollmentDetailsModal = () => {
    if (!selectedEnrollment) return null;

    return (
      <div className="admin-modal-overlay">
        <div className="admin-modal large">
          <div className="admin-modal-header">
            <h2>Enrollment Details</h2>
            <button 
              className="admin-modal-close" 
              onClick={handleCloseEnrollmentDetails}
            >
              ×
            </button>
          </div>
          
          <div className="admin-modal-content">
            <div className="enrollment-details-grid">
              <div className="detail-section">
                <h3>Student Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Student Name:</span>
                    <span className="detail-value">{selectedEnrollment.studentName || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Student Email:</span>
                    <span className="detail-value">{selectedEnrollment.studentEmail || 'No email'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Enrollment Date:</span>
                    <span className="detail-value">
                      {selectedEnrollment.enrollmentDate ? new Date(selectedEnrollment.enrollmentDate).toLocaleString() : 'Unknown date'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Course Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Course:</span>
                    <span className="detail-value">{selectedEnrollment.courseTitle || 'Unknown Course'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Course ID:</span>
                    <span className="detail-value">{selectedEnrollment.courseId || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Course Price:</span>
                    <span className="detail-value">
                      {courses.find(c => c._id === selectedEnrollment.courseId)?.price || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-${selectedEnrollment.status}`}>
                      {selectedEnrollment.status ? selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Amount Paid:</span>
                    <span className="detail-value">{selectedEnrollment.paymentAmount || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{selectedEnrollment.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">{selectedEnrollment.transactionId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="admin-modal-actions">
            {selectedEnrollment.status === 'pending' && (
              <>
                <button 
                  onClick={() => handleApproveEnrollment(selectedEnrollment)}
                  className="admin-btn success"
                >
                  ✅ Approve Enrollment
                </button>
                <button 
                  onClick={() => handleRejectEnrollment(selectedEnrollment)}
                  className="admin-btn danger"
                >
                  ❌ Reject Enrollment
                </button>
              </>
            )}
            <button 
              onClick={handleCloseEnrollmentDetails}
              className="admin-btn secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderApprovalDashboard = () => {
    return (
      <div className="admin-approval-dashboard">
        <div className="admin-page-header">
          <div className="admin-page-header-left">
            <h1 className="admin-page-title">Enrollment Approvals</h1>
            <p>Manage student course enrollments and access permissions</p>
          </div>
          <div className="admin-page-actions">
            <button 
              className="admin-btn primary"
              onClick={() => setShowApprovalSidebar(true)}
            >
              ⚡ Quick Approve
            </button>
            <button 
              className="admin-btn secondary"
              onClick={fetchPendingApprovals}
            >
              🔄 Refresh
            </button>
            <button 
              className="admin-btn warning"
              onClick={debugEnrollmentStorage}
            >
              🐛 Debug Storage
            </button>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card warning">
            <div className="admin-stat-icon">⏳</div>
            <div className="admin-stat-content">
              <h3>{approvalStats.pending}</h3>
              <p>Pending Approvals</p>
              <span className="admin-stat-change neutral">Awaiting review</span>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="admin-stat-icon">✅</div>
            <div className="admin-stat-content">
              <h3>{approvalStats.approved}</h3>
              <p>Approved</p>
              <span className="admin-stat-change positive">Active access</span>
            </div>
          </div>
          <div className="admin-stat-card danger">
            <div className="admin-stat-icon">❌</div>
            <div className="admin-stat-content">
              <h3>{approvalStats.rejected}</h3>
              <p>Rejected</p>
              <span className="admin-stat-change negative">Access denied</span>
            </div>
          </div>
          <div className="admin-stat-card info">
            <div className="admin-stat-icon">📊</div>
            <div className="admin-stat-content">
              <h3>{approvalStats.total}</h3>
              <p>Total Processed</p>
              <span className="admin-stat-change positive">All time</span>
            </div>
          </div>
        </div>

        <div className="approval-content-tabs">
          <div className="approval-tab-nav">
            <button className="approval-tab active">
              Pending Approvals ({pendingApprovals.length})
            </button>
          </div>

          <div className="approval-tab-content">
            {pendingApprovals.length > 0 ? (
              <div className="admin-table-card">
                <div className="table-header-actions">
                  <button 
                    className="admin-btn success bulk-action-btn"
                    onClick={handleBulkApprove}
                  >
                    ✅ Approve All
                  </button>
                  <div className="table-stats">
                    Showing {pendingApprovals.length} pending enrollments
                  </div>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Enrollment Date</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map((enrollment, index) => (
                      enrollment && (
                        <tr key={enrollment.id || index} className="approval-row pending">
                          <td>
                            <div className="student-cell">
                              <div className="student-avatar">
                                {enrollment.studentName ? enrollment.studentName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="student-details">
                                <strong>{enrollment.studentName || 'Unknown Student'}</strong>
                                <span>{enrollment.studentEmail || 'No email'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>{enrollment.courseTitle || 'Unknown Course'}</strong>
                            <div className="course-id">ID: {enrollment.courseId || 'N/A'}</div>
                          </td>
                          <td>
                            {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'Unknown date'}
                          </td>
                          <td>
                            <div className="payment-info">
                              <span className="payment-amount">{enrollment.paymentAmount || 'N/A'}</span>
                              <span className="payment-method">{enrollment.paymentMethod || 'N/A'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="status-badge pending">⏳ Pending</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="admin-btn action success"
                                onClick={() => handleApproveEnrollment(enrollment)}
                                title="Approve Enrollment"
                              >
                                ✅
                              </button>
                              <button 
                                className="admin-btn action danger"
                                onClick={() => handleRejectEnrollment(enrollment)}
                                title="Reject Enrollment"
                              >
                                ❌
                              </button>
                              <button 
                                className="admin-btn action primary"
                                onClick={() => handleViewEnrollmentDetails(enrollment)}
                                title="View Details"
                              >
                                👁️
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty-message">
                <div className="admin-empty-icon">🎉</div>
                <h3>No Pending Approvals</h3>
                <p>All enrollment requests have been processed. New requests will appear here automatically.</p>
                <p>When students enroll in courses from the user dashboard, their requests will appear here for approval.</p>
                <button 
                  className="admin-btn primary"
                  onClick={fetchPendingApprovals}
                >
                  🔄 Check for New Requests
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="approval-guide">
          <h3>📋 Approval Process Guide</h3>
          <div className="guide-steps">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Student Enrollment</h4>
                <p>Students enroll in courses and make payments through the user dashboard</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Review Request</h4>
                <p>Enrollment requests appear here automatically for admin review</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Approve or Reject</h4>
                <p>Approve to grant course access or reject with a reason</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Automatic Access</h4>
                <p>Approved students gain immediate access to course materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Other existing functions (fetchStats, fetchAllData, fetchChartData, etc.)
  const fetchStats = () => {
    // Your existing stats fetching logic
    setStats({
      totalStudents: 150,
      totalFees: 1250000,
      totalCertificates: 45,
      totalNotes: 23,
      totalQuizzes: 15,
      totalVideos: 67,
      activeStudents: 89,
      completionRate: 65
    });
  };

  const fetchAllData = () => {
    // Your existing data fetching logic
  };

  const fetchChartData = () => {
    // Your existing chart data fetching logic
  };

  const fetchStudents = () => {
    // Your existing students fetching logic
  };

  const fetchFeedbacks = () => {
    // Your existing feedbacks fetching logic
  };

  const fetchUserData = () => {
    // Your existing user data fetching logic
  };

  const fetchStudentReviews = () => {
    // Your existing student reviews fetching logic
  };

  const fetchPaymentHistory = () => {
    // Your existing payment history fetching logic
  };

  const fetchCertificateStats = () => {
    // Your existing certificate stats fetching logic
  };

  const renderPaymentModal = () => {
    // Your existing payment modal rendering logic
    return null;
  };

  // Update the useEffect to include progress tracking
  useEffect(() => {
    // Load courses first
    loadCourses();
    
    // Then load other data
    fetchStats();
    fetchAllData();
    fetchChartData();
    fetchStudents();
    fetchFeedbacks();
    fetchUserData();
    fetchStudentReviews();
    fetchPaymentHistory();
    fetchCertificateStats();
    fetchPendingApprovals();
    fetchStudentProgress(); // Add progress tracking

    const interval = setInterval(() => {
      fetchStudentProgress(); // Refresh progress data
      fetchCertificateStats();
      fetchStudentReviews();
      fetchPendingApprovals();
      setLastUpdate(Date.now());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Add progress tracking to the sidebar menu
  const renderSidebar = () => (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3>Navigation</h3>
      </div>
      <ul className="admin-menu">
        <li className={`admin-menu-item ${activeTab === 'dashboard' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('dashboard'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">📊</span>
            <span>Dashboard</span>
          </button>
        </li>
        
        {/* Course Management Menu Item */}
        <li className={`admin-menu-item ${activeTab === 'courses' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('courses'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">📚</span>
            <span>Course Management</span>
            <span className="admin-menu-count">{courses.length}</span>
          </button>
        </li>

        {/* Approval Menu Item */}
        <li className={`admin-menu-item ${activeTab === 'approvals' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('approvals'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">✅</span>
            <span>Enrollment Approvals</span>
            {approvalStats.pending > 0 && (
              <span className="admin-menu-count alert">{approvalStats.pending}</span>
            )}
          </button>
        </li>

        {/* Progress Tracking Menu Item */}
        <li className={`admin-menu-item ${activeTab === 'progress' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('progress'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">📈</span>
            <span>Progress Tracking</span>
            <span className="admin-menu-count">{progressStats.totalStudents}</span>
          </button>
        </li>

        <li className={`admin-menu-item ${activeTab === 'students' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('students'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">👥</span>
            <span>Students</span>
          </button>
        </li>
        <li className={`admin-menu-item ${activeTab === 'feedbacks' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('feedbacks'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">💬</span>
            <span>Student Feedback</span>
            <span className="admin-menu-count">{reviewStats.totalReviews}</span>
          </button>
        </li>
        <li className={`admin-menu-item ${activeTab === 'payment-details' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('payment-details'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">💳</span>
            <span>Payment Details</span>
            <span className="admin-menu-count">{paymentHistory.length}</span>
          </button>
        </li>
        <li className={`admin-menu-item ${activeTab === 'videos' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('videos'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">🎬</span>
            <span>Videos</span>
            <span className="admin-menu-count">{stats.totalVideos}</span>
          </button>
        </li>
        <li className={`admin-menu-item ${activeTab === 'notes' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('notes'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">📝</span>
            <span>Notes</span>
            <span className="admin-menu-count">{stats.totalNotes}</span>
          </button>
        </li>
        <li className={`admin-menu-item ${activeTab === 'quizzes' && !viewingQuiz ? 'active' : ''}`}>
          <button onClick={() => { setActiveTab('quizzes'); setViewingQuiz(null); }}>
            <span className="admin-menu-icon">❓</span>
            <span>Quizzes</span>
            <span className="admin-menu-count">{stats.totalQuizzes}</span>
          </button>
        </li>
      </ul>
    </aside>
  );

  // Update the main content to include progress tracking
  const renderMainContent = () => (
    <main className="admin-content">
      {/* Quiz View Full Page */}
      {viewingQuiz ? (
        <div className="admin-quiz-view">
          {/* Your existing quiz view code */}
        </div>
      ) : (
        <>
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="admin-dashboard-overview">
              {/* Your existing dashboard code */}
              <h1>Dashboard Overview</h1>
              <p>Welcome to Admin Dashboard</p>
            </div>
          )}

          {/* Course Management Section */}
          {activeTab === 'courses' && renderCourseManagement()}

          {/* Approval Dashboard Section */}
          {activeTab === 'approvals' && renderApprovalDashboard()}

          {/* Progress Tracking Section */}
          {activeTab === 'progress' && renderProgressTracking()}

          {/* Student Management */}
          {activeTab === 'students' && (
            <div className="admin-students-management">
              <h1>Student Management</h1>
              {/* Your existing student management code */}
            </div>
          )}

          {/* Other sections */}
          {activeTab === 'feedbacks' && (
            <div className="admin-feedbacks">
              <h1>Student Feedback</h1>
              {/* Your existing feedback code */}
            </div>
          )}

          {activeTab === 'payment-details' && (
            <div className="admin-payment-details">
              <h1>Payment Details</h1>
              {/* Your existing payment details code */}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="admin-videos">
              <h1>Video Management</h1>
              {/* Your existing videos code */}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="admin-notes">
              <h1>Notes Management</h1>
              {/* Your existing notes code */}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="admin-quizzes">
              <h1>Quiz Management</h1>
              {/* Your existing quizzes code */}
            </div>
          )}
        </>
      )}
    </main>
  );

  return (
    <div className="admin-dashboard">
      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-right">
          {/* Approval Notification Badge */}
          {approvalStats.pending > 0 && (
            <div className="approval-notification">
              <button 
                className="approval-alert-btn"
                onClick={() => setShowApprovalSidebar(true)}
              >
                ⏳ {approvalStats.pending} Pending
              </button>
            </div>
          )}
          <div className="admin-user">
            <div className="admin-user-avatar">A</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="admin-container">
        {renderSidebar()}
        {renderMainContent()}
      </div>

      {/* Course Sidebar */}
      {renderCourseSidebar()}

      {/* Approval Sidebar */}
      {renderApprovalSidebar()}

      {/* Enrollment Details Modal */}
      {renderEnrollmentDetailsModal()}

      {/* Student Progress Details Modal */}
      {renderStudentProgressDetails()}

      {/* Payment Modal */}
      {renderPaymentModal()}
    </div>
  );
}

export default AdminDashboard;