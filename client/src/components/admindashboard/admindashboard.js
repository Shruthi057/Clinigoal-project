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
  const [studentProgress, setStudentProgress] = useState([]);
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
    search: '',
    status: 'all',
    dateRange: 'all'
  });

  // Activity Tracking State (Replaces Progress Tracking)
  const [activityData, setActivityData] = useState([]);
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    userEngagement: 0,
    popularCourses: {},
    recentActions: []
  });

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
        // Initialize with sample courses if no courses exist
        const sampleCourses = [
          {
            _id: 'course_1',
            title: 'Clinical Research Fundamentals',
            description: 'Learn the basics of clinical research methodology and practices.',
            instructor: 'Dr. Ananya Sharma',
            duration: '12 weeks',
            level: 'Beginner',
            price: '₹9,999',
            image: '',
            features: ['Hands-on projects', 'Industry expert mentors', 'Certificate of completion'],
            category: 'Clinical Research',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'course_2',
            title: 'Bioinformatics for Beginners',
            description: 'Introduction to bioinformatics tools and data analysis techniques.',
            instructor: 'Prof. Rajiv Menon',
            duration: '10 weeks',
            level: 'Beginner',
            price: '₹8,999',
            image: '',
            features: ['Real-world datasets', 'Python programming', 'Bioinformatics tools'],
            category: 'Bioinformatics',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'course_3',
            title: 'Medical Coding Mastery',
            description: 'Master medical coding and billing procedures for healthcare.',
            instructor: 'Ms. Priya Nair',
            duration: '14 weeks',
            level: 'Intermediate',
            price: '₹12,999',
            image: '',
            features: ['CPT & ICD-10 coding', 'Real case studies', 'Industry certification prep'],
            category: 'Healthcare',
            createdAt: new Date().toISOString()
          }
        ];
        console.log("📚 No courses found, initializing with sample courses");
        setCourses(sampleCourses);
        localStorage.setItem('clinigoalCourses', JSON.stringify(sampleCourses));
        return sampleCourses;
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

  // ========== ACTIVITY TRACKING FUNCTIONS (REPLACES PROGRESS TRACKING) ==========

  const fetchActivityData = () => {
    try {
      console.log("🔄 Fetching activity data...");
      
      const activities = [];
      const today = new Date().toDateString();
      let todayActivityCount = 0;
      const popularCourses = {};
      const recentActions = [];

      // Get user login logs for activity tracking
      const userLoginLogs = JSON.parse(localStorage.getItem('userLoginLogs') || '[]');
      
      // Track logins as activities
      userLoginLogs.forEach(log => {
        if (log && log.email) {
          const activityDate = new Date(log.timestamp).toDateString();
          const isToday = activityDate === today;
          
          if (isToday) todayActivityCount++;
          
          activities.push({
            id: `login_${log.timestamp}`,
            type: 'login',
            userEmail: log.email,
            userName: log.name || log.email.split('@')[0],
            timestamp: log.timestamp,
            description: `${log.name || log.email.split('@')[0]} logged in`,
            icon: '👤'
          });

          recentActions.push({
            id: `login_${log.timestamp}`,
            action: 'User Login',
            user: log.name || log.email.split('@')[0],
            time: getTimeAgo(log.timestamp),
            icon: '🔐'
          });
        }
      });

      // Track course enrollments as activities
      const allEnrollments = JSON.parse(localStorage.getItem('allEnrollments') || '[]');
      allEnrollments.forEach(enrollment => {
        if (enrollment && enrollment.studentEmail) {
          const course = courses.find(c => c._id === enrollment.courseId);
          if (course) {
            popularCourses[course._id] = (popularCourses[course._id] || 0) + 1;
            
            activities.push({
              id: `enroll_${enrollment.id}`,
              type: 'enrollment',
              userEmail: enrollment.studentEmail,
              userName: enrollment.studentName,
              courseId: enrollment.courseId,
              courseTitle: course.title,
              timestamp: enrollment.enrollmentDate || new Date().toISOString(),
              description: `${enrollment.studentName} enrolled in ${course.title}`,
              icon: '🎓'
            });

            recentActions.push({
              id: `enroll_${enrollment.id}`,
              action: 'Course Enrollment',
              user: enrollment.studentName,
              course: course.title,
              time: getTimeAgo(enrollment.enrollmentDate),
              icon: '📚'
            });
          }
        }
      });

      // Add sample activities if no real data
      if (activities.length === 0) {
        const sampleActivities = [
          {
            id: 'activity_1',
            type: 'login',
            userEmail: 'john@example.com',
            userName: 'John Doe',
            timestamp: new Date().toISOString(),
            description: 'John Doe logged in',
            icon: '👤'
          },
          {
            id: 'activity_2',
            type: 'enrollment',
            userEmail: 'jane@example.com',
            userName: 'Jane Smith',
            courseId: 'course_1',
            courseTitle: 'Clinical Research Fundamentals',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            description: 'Jane Smith enrolled in Clinical Research Fundamentals',
            icon: '🎓'
          },
          {
            id: 'activity_3',
            type: 'video_watch',
            userEmail: 'mike@example.com',
            userName: 'Mike Johnson',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            description: 'Mike Johnson watched 5 videos',
            icon: '🎬'
          },
          {
            id: 'activity_4',
            type: 'quiz_completion',
            userEmail: 'sarah@example.com',
            userName: 'Sarah Wilson',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            description: 'Sarah Wilson completed a quiz',
            icon: '✅'
          }
        ];
        activities.push(...sampleActivities);
        todayActivityCount = 2;
        
        // Add sample popular courses
        popularCourses['course_1'] = 3;
        popularCourses['course_2'] = 2;
        popularCourses['course_3'] = 1;
      }

      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      recentActions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setActivityData(activities);

      // Calculate user engagement (percentage of active users)
      const uniqueActiveUsers = new Set(activities.map(activity => activity.userEmail)).size;
      const totalUsers = uniqueUsers.length || 5; // Fallback to 5 if no users
      const userEngagement = totalUsers > 0 ? Math.round((uniqueActiveUsers / totalUsers) * 100) : 0;

      setActivityStats({
        totalActivities: activities.length,
        todayActivities: todayActivityCount,
        userEngagement: userEngagement,
        popularCourses: popularCourses,
        recentActions: recentActions.slice(0, 10) // Last 10 actions
      });

      console.log("📊 Activity data loaded:", activities.length, "activities");

    } catch (error) {
      console.error("❌ Error fetching activity data:", error);
      setActivityData([]);
      setActivityStats({
        totalActivities: 0,
        todayActivities: 0,
        userEngagement: 0,
        popularCourses: {},
        recentActions: []
      });
    }
  };

  // ========== UPDATED ACTIVITY TRACKING COMPONENT ==========

  const renderActivityTracking = () => {
    // Get top 3 popular courses
    const popularCoursesList = Object.entries(activityStats.popularCourses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([courseId, count]) => {
        const course = courses.find(c => c._id === courseId);
        return course ? { ...course, enrollmentCount: count } : null;
      })
      .filter(Boolean);

    return (
      <div className="admin-activity-tracking">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Platform Activity Tracking</h1>
          <div className="admin-page-actions">
            <button className="admin-btn primary" onClick={fetchActivityData}>
              🔄 Refresh Activity
            </button>
            <button className="admin-btn secondary" onClick={() => setActiveTab('students')}>
              👥 View Students
            </button>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card primary">
            <div className="admin-stat-icon">📈</div>
            <div className="admin-stat-content">
              <h3>{activityStats.totalActivities}</h3>
              <p>Total Activities</p>
              <span className="admin-stat-change positive">All platform actions</span>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="admin-stat-icon">🕒</div>
            <div className="admin-stat-content">
              <h3>{activityStats.todayActivities}</h3>
              <p>Today's Activities</p>
              <span className="admin-stat-change positive">Real-time tracking</span>
            </div>
          </div>
          <div className="admin-stat-card warning">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-content">
              <h3>{activityStats.userEngagement}%</h3>
              <p>User Engagement</p>
              <span className="admin-stat-change positive">Active users</span>
            </div>
          </div>
          <div className="admin-stat-card info">
            <div className="admin-stat-icon">📚</div>
            <div className="admin-stat-content">
              <h3>{popularCoursesList.length}</h3>
              <p>Popular Courses</p>
              <span className="admin-stat-change positive">Top enrolled</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="admin-activity-feed">
          <h3>🔄 Recent Platform Activity</h3>
          
          <div className="activity-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search activities..."
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select className="filter-select">
                <option value="all">All Activities</option>
                <option value="login">Logins</option>
                <option value="enrollment">Enrollments</option>
                <option value="video_watch">Video Views</option>
                <option value="quiz_completion">Quiz Completions</option>
              </select>
            </div>
          </div>

          <div className="admin-table-card">
            {activityData.length > 0 ? (
              <div className="activity-list">
                {activityData.slice(0, 20).map((activity, index) => (
                  <div key={activity.id || index} className="activity-item">
                    <div className="activity-icon">
                      {activity.icon || '📊'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-description">
                        {activity.description}
                      </div>
                      <div className="activity-meta">
                        <span className="activity-time">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                        {activity.courseTitle && (
                          <span className="activity-course">
                            📚 {activity.courseTitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="activity-user">
                      <div className="user-avatar">
                        {activity.userName ? activity.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="user-name">{activity.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty-message">
                <div className="admin-empty-icon">📊</div>
                <h3>No Activity Data Yet</h3>
                <p>Platform activity will appear here as users interact with the system.</p>
                <p>Activities include logins, course enrollments, video views, and quiz completions.</p>
                <button className="admin-btn primary" onClick={fetchActivityData}>
                  🔄 Check for Activity
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Popular Courses Section */}
        <div className="popular-courses-section">
          <h3>🎯 Most Popular Courses</h3>
          <div className="popular-courses-grid">
            {popularCoursesList.map((course, index) => (
              <div key={course._id} className="popular-course-card">
                <div className="course-rank">
                  <span className="rank-number">#{index + 1}</span>
                </div>
                <div className="course-info">
                  <h4>{course.title}</h4>
                  <p className="course-instructor">👨‍🏫 {course.instructor}</p>
                  <div className="course-stats">
                    <span className="enrollment-count">
                      📊 {course.enrollmentCount} enrollments
                    </span>
                    <span className="course-level">{course.level}</span>
                  </div>
                </div>
                <div className="popularity-badge">
                  <div className="popularity-bar">
                    <div 
                      className="popularity-fill" 
                      style={{ 
                        width: `${Math.min(100, (course.enrollmentCount / Math.max(1, popularCoursesList[0]?.enrollmentCount || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {popularCoursesList.length === 0 && (
            <div className="admin-empty-message small">
              <p>No enrollment data available yet. Courses will appear here as students enroll.</p>
            </div>
          )}
        </div>

        {/* Quick Actions Summary */}
        <div className="quick-actions-summary">
          <h3>⚡ Recent Actions Summary</h3>
          <div className="actions-grid">
            {activityStats.recentActions.slice(0, 5).map((action, index) => (
              <div key={action.id || index} className="action-item">
                <div className="action-icon">{action.icon}</div>
                <div className="action-details">
                  <strong>{action.action}</strong>
                  <span>by {action.user}</span>
                  {action.course && <span>in {action.course}</span>}
                </div>
                <div className="action-time">{action.time}</div>
              </div>
            ))}
            {activityStats.recentActions.length === 0 && (
              <div className="no-actions-message">
                <p>No recent actions to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== APPROVAL SYSTEM FUNCTIONS ==========

  const fetchPendingApprovals = () => {
    try {
      console.log("🔄 Fetching pending approvals...");
      
      // Create sample enrollment data for demonstration
      const sampleEnrollments = [
        {
          id: 'enroll_1',
          studentName: 'John Doe',
          studentEmail: 'john@example.com',
          courseId: 'course_1',
          courseTitle: 'Clinical Research Fundamentals',
          enrollmentDate: new Date().toISOString(),
          paymentAmount: '₹9,999',
          paymentMethod: 'razorpay',
          status: 'pending',
          transactionId: 'TXN_0012345678'
        },
        {
          id: 'enroll_2',
          studentName: 'Jane Smith',
          studentEmail: 'jane@example.com',
          courseId: 'course_2',
          courseTitle: 'Bioinformatics for Beginners',
          enrollmentDate: new Date(Date.now() - 86400000).toISOString(),
          paymentAmount: '₹8,999',
          paymentMethod: 'razorpay',
          status: 'pending',
          transactionId: 'TXN_0012345679'
        },
        {
          id: 'enroll_3',
          studentName: 'Mike Johnson',
          studentEmail: 'mike@example.com',
          courseId: 'course_1',
          courseTitle: 'Clinical Research Fundamentals',
          enrollmentDate: new Date(Date.now() - 172800000).toISOString(),
          paymentAmount: '₹9,999',
          paymentMethod: 'razorpay',
          status: 'pending',
          transactionId: 'TXN_0012345680'
        }
      ];

      // Try to get real data first, fall back to sample data
      const allEnrollments = JSON.parse(localStorage.getItem('allEnrollments') || '[]');
      const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
      const adminApprovals = JSON.parse(localStorage.getItem('adminApprovals') || '{}');

      let allPending = [
        ...(Array.isArray(allEnrollments) ? allEnrollments.filter(e => e && e.status === 'pending') : []),
        ...(Array.isArray(pendingEnrollments) ? pendingEnrollments : []),
        ...(Array.isArray(adminApprovals.pending) ? adminApprovals.pending : [])
      ].filter((enrollment, index, array) => 
        enrollment && array.findIndex(e => e.id === enrollment.id) === index
      );

      // If no real data, use sample data
      if (allPending.length === 0) {
        allPending = sampleEnrollments;
      }

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
      // Fallback to sample data
      const sampleEnrollments = [
        {
          id: 'enroll_1',
          studentName: 'John Doe',
          studentEmail: 'john@example.com',
          courseId: 'course_1',
          courseTitle: 'Clinical Research Fundamentals',
          enrollmentDate: new Date().toISOString(),
          paymentAmount: '₹9,999',
          paymentMethod: 'razorpay',
          status: 'pending'
        }
      ];
      setPendingApprovals(sampleEnrollments);
      setApprovedEnrollments([]);
      setRejectedEnrollments([]);
      setApprovalStats({
        pending: sampleEnrollments.length,
        approved: 0,
        rejected: 0,
        total: sampleEnrollments.length
      });
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

        // Update the enrollment status
        const updatedEnrollment = {
          ...enrollment,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: 'Admin'
        };

        // Remove from pending and add to approved
        const updatedPending = pendingApprovals.filter(e => e.id !== enrollment.id);
        const updatedApproved = [...approvedEnrollments, updatedEnrollment];

        setPendingApprovals(updatedPending);
        setApprovedEnrollments(updatedApproved);

        setApprovalStats(prev => ({
          ...prev,
          pending: updatedPending.length,
          approved: updatedApproved.length
        }));

        // Update user access
        updateUserDashboardOnApproval(enrollment.studentEmail, enrollment.courseId);

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

        // Update the enrollment status
        const updatedEnrollment = {
          ...enrollment,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
          rejectedBy: 'Admin'
        };

        // Remove from pending and add to rejected
        const updatedPending = pendingApprovals.filter(e => e.id !== enrollment.id);
        const updatedRejected = [...rejectedEnrollments, updatedEnrollment];

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
        const updatedApproved = [
          ...approvedEnrollments,
          ...pendingApprovals.map(enrollment => ({
            ...enrollment,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: 'Admin',
            bulkApproved: true
          }))
        ];

        // Update user access for all approved enrollments
        pendingApprovals.forEach(enrollment => {
          updateUserDashboardOnApproval(enrollment.studentEmail, enrollment.courseId);
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

  const handleViewEnrollmentDetails = (enrollment) => {
    if (enrollment) {
      setSelectedEnrollment(enrollment);
    }
  };

  const handleCloseEnrollmentDetails = () => {
    setSelectedEnrollment(null);
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
            <div className="enrollment-detail-section">
              <h3>Student Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedEnrollment.studentName || 'Unknown Student'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedEnrollment.studentEmail || 'No email'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Enrollment Date:</span>
                  <span className="detail-value">
                    {selectedEnrollment.enrollmentDate ? 
                      new Date(selectedEnrollment.enrollmentDate).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>

            <div className="enrollment-detail-section">
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
                  <span className="detail-label">Instructor:</span>
                  <span className="detail-value">
                    {courses.find(c => c._id === selectedEnrollment.courseId)?.instructor || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="enrollment-detail-section">
              <h3>Payment Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
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

            <div className="enrollment-detail-section">
              <h3>Status Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Current Status:</span>
                  <span className={`detail-value status-${selectedEnrollment.status || 'pending'}`}>
                    {selectedEnrollment.status || 'Pending'}
                  </span>
                </div>
                {selectedEnrollment.approvedAt && (
                  <div className="detail-item">
                    <span className="detail-label">Approved Date:</span>
                    <span className="detail-value">
                      {new Date(selectedEnrollment.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedEnrollment.rejectedAt && (
                  <div className="detail-item">
                    <span className="detail-label">Rejected Date:</span>
                    <span className="detail-value">
                      {new Date(selectedEnrollment.rejectedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedEnrollment.rejectionReason && (
              <div className="enrollment-detail-section">
                <h3>Rejection Reason</h3>
                <div className="rejection-reason">
                  <p>{selectedEnrollment.rejectionReason}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="admin-modal-actions">
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

  // ========== PAYMENT HISTORY FUNCTIONS ==========

  const fetchPaymentHistory = async () => {
    try {
      console.log("💰 Fetching payment history...");
      
      // Sample payment data with realistic information
      const samplePayments = [
        {
          id: 'payment_1',
          userId: 'user_1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          courseId: 'course_1',
          courseTitle: 'Clinical Research Fundamentals',
          amount: '₹9,999',
          paymentMethod: 'razorpay',
          status: 'completed',
          date: new Date('2024-01-15').toISOString(),
          transactionId: 'TXN_0012345678',
          receiptUrl: '#',
          currency: 'INR',
          invoiceNumber: 'INV-2024-001'
        },
        {
          id: 'payment_2',
          userId: 'user_2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          courseId: 'course_2',
          courseTitle: 'Bioinformatics for Beginners',
          amount: '₹8,999',
          paymentMethod: 'razorpay',
          status: 'completed',
          date: new Date('2024-01-14').toISOString(),
          transactionId: 'TXN_0012345679',
          receiptUrl: '#',
          currency: 'INR',
          invoiceNumber: 'INV-2024-002'
        },
        {
          id: 'payment_3',
          userId: 'user_3',
          userName: 'Mike Johnson',
          userEmail: 'mike@example.com',
          courseId: 'course_1',
          courseTitle: 'Clinical Research Fundamentals',
          amount: '₹9,999',
          paymentMethod: 'card',
          status: 'completed',
          date: new Date('2024-01-13').toISOString(),
          transactionId: 'TXN_0012345680',
          receiptUrl: '#',
          currency: 'INR',
          invoiceNumber: 'INV-2024-003'
        },
        {
          id: 'payment_4',
          userId: 'user_4',
          userName: 'Sarah Wilson',
          userEmail: 'sarah@example.com',
          courseId: 'course_2',
          courseTitle: 'Bioinformatics for Beginners',
          amount: '₹8,999',
          paymentMethod: 'upi',
          status: 'completed',
          date: new Date('2024-01-12').toISOString(),
          transactionId: 'TXN_0012345681',
          receiptUrl: '#',
          currency: 'INR',
          invoiceNumber: 'INV-2024-004'
        },
        {
          id: 'payment_5',
          userId: 'user_5',
          userName: 'David Brown',
          userEmail: 'david@example.com',
          courseId: 'course_1',
          courseTitle: 'Clinical Research Fundamentals',
          amount: '₹9,999',
          paymentMethod: 'razorpay',
          status: 'failed',
          date: new Date('2024-01-11').toISOString(),
          transactionId: 'TXN_0012345682',
          receiptUrl: '#',
          currency: 'INR',
          invoiceNumber: 'INV-2024-005',
          failureReason: 'Insufficient funds'
        },
        {
          id: 'payment_6',
          userId: 'user_6',
          userName: 'Emily Davis',
          userEmail: 'emily@example.com',
          courseId: 'course_2',
          courseTitle: 'Bioinformatics for Beginners',
          amount: '₹8,999',
          paymentMethod: 'razorpay',
          status: 'pending',
          date: new Date('2024-01-10').toISOString(),
          transactionId: 'TXN_0012345683',
          receiptUrl: '#',
          currency: 'INR',
          invoiceNumber: 'INV-2024-006'
        }
      ];

      // Try to get real data from localStorage first
      try {
        const userPaymentHistory = localStorage.getItem('userPaymentHistory');
        if (userPaymentHistory) {
          const payments = JSON.parse(userPaymentHistory);
          if (Array.isArray(payments) && payments.length > 0) {
            console.log("💰 Payments from localStorage:", payments.length);
            setPaymentHistory(payments);
            return;
          }
        }
      } catch (localStorageError) {
        console.log("No payment data in localStorage, using sample data");
      }

      // Use sample data if no real data found
      console.log("💰 Using sample payment data");
      setPaymentHistory(samplePayments);
      
      // Save sample data to localStorage for future use
      localStorage.setItem('userPaymentHistory', JSON.stringify(samplePayments));

    } catch (error) {
      console.error("❌ Error fetching payment history:", error);
      setPaymentHistory([]);
    }
  };

  const getFilteredPayments = () => {
    return paymentHistory.filter(payment => {
      if (!payment) return false;
      
      const matchesMethod = paymentFilters.paymentMethod === 'all' || 
                           payment.paymentMethod === paymentFilters.paymentMethod;
      const matchesStatus = paymentFilters.status === 'all' || 
                           payment.status === paymentFilters.status;
      const matchesSearch = paymentFilters.search === '' || 
        (payment.userName && payment.userName.toLowerCase().includes(paymentFilters.search.toLowerCase())) ||
        (payment.courseTitle && payment.courseTitle.toLowerCase().includes(paymentFilters.search.toLowerCase())) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(paymentFilters.search.toLowerCase())) ||
        (payment.userEmail && payment.userEmail.toLowerCase().includes(paymentFilters.search.toLowerCase()));
      
      // Date range filtering
      let matchesDateRange = true;
      if (paymentFilters.dateRange !== 'all' && payment.date) {
        const paymentDate = new Date(payment.date);
        const today = new Date();
        
        switch (paymentFilters.dateRange) {
          case 'today':
            matchesDateRange = paymentDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDateRange = paymentDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            matchesDateRange = paymentDate >= monthAgo;
            break;
          default:
            matchesDateRange = true;
        }
      }
      
      return matchesMethod && matchesStatus && matchesSearch && matchesDateRange;
    });
  };

  const calculatePaymentStats = () => {
    const completedPayments = paymentHistory.filter(p => p.status === 'completed');
    const totalRevenue = completedPayments.reduce((sum, payment) => {
      if (!payment || !payment.amount) return sum;
      const amount = parseInt(payment.amount.replace(/[^0-9]/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const uniqueStudents = new Set(paymentHistory.map(p => p && p.userId).filter(Boolean)).size;
    
    const today = new Date().toDateString();
    const todayPayments = paymentHistory.filter(p => {
      if (!p.date) return false;
      return new Date(p.date).toDateString() === today;
    });

    const statusCounts = {
      completed: paymentHistory.filter(p => p.status === 'completed').length,
      pending: paymentHistory.filter(p => p.status === 'pending').length,
      failed: paymentHistory.filter(p => p.status === 'failed').length
    };

    return {
      totalRevenue,
      completedPayments: completedPayments.length,
      totalPayments: paymentHistory.length,
      uniqueStudents,
      todayPayments: todayPayments.length,
      statusCounts
    };
  };

  const handlePaymentFilterChange = (filterType, value) => {
    setPaymentFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const viewPaymentDetails = (payment) => {
    if (payment) {
      setSelectedPayment(payment);
      setShowPaymentModal(true);
    }
  };

  const downloadReceipt = (payment) => {
    if (!payment) return;
    
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.courseTitle}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: #f5f5f5;
          }
          .receipt-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 20px;
          }
          .receipt-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .receipt-subtitle {
            color: #7f8c8d;
            font-size: 16px;
          }
          .receipt-details {
            margin: 30px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ecf0f1;
          }
          .detail-label {
            font-weight: bold;
            color: #2c3e50;
          }
          .detail-value {
            color: #34495e;
          }
          .amount-row {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .receipt-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #bdc3c7;
            color: #7f8c8d;
            font-size: 14px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 10px;
          }
          .status-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-completed {
            background: #d4edda;
            color: #155724;
          }
          @media print {
            body { background: white; }
            .receipt-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <div class="logo">CLINIGOAL</div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
            <div class="receipt-subtitle">Thank you for your payment</div>
          </div>
          
          <div class="receipt-details">
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${payment.transactionId || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">${payment.invoiceNumber || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date & Time:</span>
              <span class="detail-value">
                ${payment.date ? new Date(payment.date).toLocaleString() : 'Unknown date'}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Course:</span>
              <span class="detail-value">${payment.courseTitle || 'Unknown Course'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${payment.userName || 'Unknown Student'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Email:</span>
              <span class="detail-value">${payment.userEmail || 'No email'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${payment.paymentMethod ? payment.paymentMethod.toUpperCase() : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">
                <span class="status-badge status-${payment.status || 'pending'}">
                  ${payment.status ? payment.status.toUpperCase() : 'PENDING'}
                </span>
              </span>
            </div>
            
            <div class="amount-row">
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value" style="font-size: 24px; font-weight: bold; color: #27ae60;">
                  ${payment.amount || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div class="receipt-footer">
            <p>This is an computer-generated receipt. No signature is required.</p>
            <p>For any queries, contact support@clinigoal.com</p>
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
    
    setTimeout(() => {
      receiptWindow.print();
    }, 500);
  };

  const exportPaymentsToCSV = () => {
    const filteredPayments = getFilteredPayments();
    if (filteredPayments.length === 0) {
      alert("No payments to export.");
      return;
    }

    const headers = ['Date', 'Student Name', 'Student Email', 'Course', 'Amount', 'Payment Method', 'Status', 'Transaction ID'];
    const csvData = filteredPayments.map(payment => [
      payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A',
      payment.userName || 'N/A',
      payment.userEmail || 'N/A',
      payment.courseTitle || 'N/A',
      payment.amount || 'N/A',
      payment.paymentMethod || 'N/A',
      payment.status || 'N/A',
      payment.transactionId || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert(`✅ Exported ${filteredPayments.length} payments to CSV`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'success', text: '✅ Completed', icon: '✅' },
      pending: { class: 'warning', text: '⏳ Pending', icon: '⏳' },
      failed: { class: 'danger', text: '❌ Failed', icon: '❌' }
    };
    
    const config = statusConfig[status] || { class: 'secondary', text: status, icon: '❓' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      razorpay: { class: 'primary', text: '💳 Razorpay', icon: '💳' },
      card: { class: 'info', text: '💳 Card', icon: '💳' },
      upi: { class: 'success', text: '📱 UPI', icon: '📱' },
      netbanking: { class: 'warning', text: '🏦 Net Banking', icon: '🏦' }
    };
    
    const config = methodConfig[method] || { class: 'secondary', text: method, icon: '💸' };
    return (
      <span className={`method-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  // ========== COMPLETE PAYMENT DETAILS COMPONENT ==========

  const renderPaymentDetails = () => {
    const filteredPayments = getFilteredPayments();
    const paymentStats = calculatePaymentStats();

    return (
      <div className="admin-payment-details">
        <div className="admin-page-header">
          <div className="admin-page-header-left">
            <h1 className="admin-page-title">Payment Details & Receipts</h1>
            <p>Manage and view all payment transactions with detailed information</p>
          </div>
          <div className="admin-page-actions">
            <button 
              className="admin-btn primary"
              onClick={exportPaymentsToCSV}
            >
              📊 Export CSV
            </button>
            <button 
              className="admin-btn secondary"
              onClick={fetchPaymentHistory}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card primary">
            <div className="admin-stat-icon">💰</div>
            <div className="admin-stat-content">
              <h3>₹{formatNumber(paymentStats.totalRevenue)}</h3>
              <p>Total Revenue</p>
              <span className="admin-stat-change positive">Completed payments</span>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="admin-stat-icon">📊</div>
            <div className="admin-stat-content">
              <h3>{paymentStats.totalPayments}</h3>
              <p>Total Payments</p>
              <span className="admin-stat-change positive">All transactions</span>
            </div>
          </div>
          <div className="admin-stat-card warning">
            <div className="admin-stat-icon">✅</div>
            <div className="admin-stat-content">
              <h3>{paymentStats.completedPayments}</h3>
              <p>Completed</p>
              <span className="admin-stat-change positive">Successful payments</span>
            </div>
          </div>
          <div className="admin-stat-card info">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-content">
              <h3>{paymentStats.uniqueStudents}</h3>
              <p>Paid Students</p>
              <span className="admin-stat-change positive">Unique payers</span>
            </div>
          </div>
        </div>

        {/* Payment Status Overview */}
        <div className="payment-status-overview">
          <h3>📈 Payment Status Overview</h3>
          <div className="status-cards">
            <div className="status-card completed">
              <div className="status-icon">✅</div>
              <div className="status-info">
                <span className="status-count">{paymentStats.statusCounts.completed}</span>
                <span className="status-label">Completed</span>
              </div>
            </div>
            <div className="status-card pending">
              <div className="status-icon">⏳</div>
              <div className="status-info">
                <span className="status-count">{paymentStats.statusCounts.pending}</span>
                <span className="status-label">Pending</span>
              </div>
            </div>
            <div className="status-card failed">
              <div className="status-icon">❌</div>
              <div className="status-info">
                <span className="status-count">{paymentStats.statusCounts.failed}</span>
                <span className="status-label">Failed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Filters */}
        <div className="admin-payment-filters">
          <div className="filter-section">
            <h4>🔍 Search & Filter Payments</h4>
            <div className="filter-grid">
              <div className="admin-search-box">
                <span className="admin-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by student, course, email, or transaction ID..."
                  className="admin-search-input"
                  value={paymentFilters.search}
                  onChange={(e) => handlePaymentFilterChange('search', e.target.value)}
                />
              </div>
              
              <div className="admin-filter-group">
                <label>Payment Method</label>
                <select 
                  className="admin-filter-select"
                  value={paymentFilters.paymentMethod}
                  onChange={(e) => handlePaymentFilterChange('paymentMethod', e.target.value)}
                >
                  <option value="all">All Methods</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>

              <div className="admin-filter-group">
                <label>Payment Status</label>
                <select 
                  className="admin-filter-select"
                  value={paymentFilters.status}
                  onChange={(e) => handlePaymentFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="admin-filter-group">
                <label>Date Range</label>
                <select 
                  className="admin-filter-select"
                  value={paymentFilters.dateRange}
                  onChange={(e) => handlePaymentFilterChange('dateRange', e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length > 0 ? (
          <div className="admin-table-card">
            <div className="table-header">
              <div className="table-title">
                <h3>Payment Transactions</h3>
                <span className="table-subtitle">
                  Showing {filteredPayments.length} of {paymentHistory.length} payments
                </span>
              </div>
              <div className="table-actions">
                <button 
                  className="admin-btn secondary"
                  onClick={() => setPaymentFilters({
                    paymentMethod: 'all',
                    search: '',
                    status: 'all',
                    dateRange: 'all'
                  })}
                >
                  🗑️ Clear Filters
                </button>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, index) => (
                    payment && (
                      <tr key={payment.id || index} className="admin-payment-row">
                        <td className="admin-payment-date">
                          <div>
                            <strong>{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</strong>
                            <div style={{fontSize: '12px', color: '#666'}}>
                              {payment.date ? new Date(payment.date).toLocaleTimeString() : ''}
                            </div>
                          </div>
                        </td>
                        <td className="admin-payment-student">
                          <div className="student-info">
                            <div className="student-avatar">
                              {payment.userName ? payment.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="student-details">
                              <strong>{payment.userName || 'Unknown Student'}</strong>
                              <div style={{fontSize: '12px', color: '#666'}}>
                                {payment.userEmail || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="admin-payment-course">
                          <strong>{payment.courseTitle || 'Unknown Course'}</strong>
                          <div style={{fontSize: '12px', color: '#666'}}>
                            {payment.invoiceNumber ? `Invoice: ${payment.invoiceNumber}` : ''}
                          </div>
                        </td>
                        <td className="admin-payment-amount">
                          <span className="admin-amount-badge">{payment.amount || 'N/A'}</span>
                        </td>
                        <td className="admin-payment-method">
                          {getPaymentMethodBadge(payment.paymentMethod)}
                        </td>
                        <td className="admin-payment-status">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="admin-payment-transaction">
                          <code style={{fontSize: '12px'}}>
                            {payment.transactionId || 'N/A'}
                          </code>
                        </td>
                        <td className="admin-payment-actions">
                          <div className="action-buttons">
                            <button 
                              onClick={() => viewPaymentDetails(payment)}
                              className="admin-btn action view"
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button 
                              onClick={() => downloadReceipt(payment)}
                              className="admin-btn action primary"
                              title="Download Receipt"
                            >
                              📥
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination or summary */}
            <div className="table-footer">
              <div className="table-summary">
                Showing {filteredPayments.length} payments
                {paymentFilters.search && ` matching "${paymentFilters.search}"`}
                {paymentFilters.paymentMethod !== 'all' && ` with ${paymentFilters.paymentMethod}`}
                {paymentFilters.status !== 'all' && ` (${paymentFilters.status})`}
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-empty-message">
            <div className="admin-empty-icon">💳</div>
            <h3>No Payments Found</h3>
            <p>No payment records match your current filters.</p>
            <button 
              onClick={() => setPaymentFilters({ 
                paymentMethod: 'all', 
                search: '', 
                status: 'all',
                dateRange: 'all'
              })}
              className="admin-btn primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Recent Payment Activity */}
        <div className="recent-payments-section">
          <h3>🕒 Recent Payment Activity</h3>
          <div className="recent-payments-grid">
            {paymentHistory
              .filter(p => p.status === 'completed')
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 4)
              .map((payment, index) => (
                <div key={payment.id || index} className="recent-payment-card">
                  <div className="payment-header">
                    <div className="student-avatar small">
                      {payment.userName ? payment.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="payment-info">
                      <strong>{payment.userName}</strong>
                      <span>{payment.courseTitle}</span>
                    </div>
                    <span className="payment-amount">{payment.amount}</span>
                  </div>
                  <div className="payment-meta">
                    <span>{getTimeAgo(payment.date)}</span>
                    <span>{getPaymentMethodBadge(payment.paymentMethod)}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  };

  // ========== PAYMENT MODAL COMPONENT ==========

  const renderPaymentModal = () => {
    if (!showPaymentModal || !selectedPayment) return null;

    return (
      <div className="admin-modal-overlay">
        <div className="admin-modal large">
          <div className="admin-modal-header">
            <h2>Payment Details</h2>
            <button 
              className="admin-modal-close" 
              onClick={() => setShowPaymentModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="admin-modal-content">
            <div className="admin-detail-section">
              <h3>💳 Transaction Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Transaction ID:</span>
                  <span className="admin-detail-value">{selectedPayment.transactionId || 'N/A'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Invoice Number:</span>
                  <span className="admin-detail-value">{selectedPayment.invoiceNumber || 'N/A'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Date & Time:</span>
                  <span className="admin-detail-value">
                    {selectedPayment.date ? new Date(selectedPayment.date).toLocaleString() : 'Unknown date'}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Payment Method:</span>
                  <span className="admin-detail-value">
                    {getPaymentMethodBadge(selectedPayment.paymentMethod)}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Status:</span>
                  <span className="admin-detail-value">
                    {getStatusBadge(selectedPayment.status)}
                  </span>
                </div>
                {selectedPayment.failureReason && (
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Failure Reason:</span>
                    <span className="admin-detail-value error">{selectedPayment.failureReason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>📚 Course Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Course:</span>
                  <span className="admin-detail-value">{selectedPayment.courseTitle || 'Unknown Course'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Course ID:</span>
                  <span className="admin-detail-value">{selectedPayment.courseId || 'N/A'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Amount:</span>
                  <span className="admin-detail-value amount">{selectedPayment.amount || 'N/A'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Currency:</span>
                  <span className="admin-detail-value">{selectedPayment.currency || 'INR'}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>👤 Student Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student Name:</span>
                  <span className="admin-detail-value">{selectedPayment.userName || 'Unknown Student'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student Email:</span>
                  <span className="admin-detail-value">{selectedPayment.userEmail || 'No email'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student ID:</span>
                  <span className="admin-detail-value">{selectedPayment.userId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>💰 Payment Amount</h3>
              <div className="admin-amount-display">
                <span className="admin-amount-label">Total Paid:</span>
                <span className="admin-amount-value">{selectedPayment.amount || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="admin-modal-actions">
            <button 
              onClick={() => downloadReceipt(selectedPayment)}
              className="admin-btn primary"
            >
              📥 Download Receipt
            </button>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="admin-btn secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== OTHER ESSENTIAL FUNCTIONS ==========

  const fetchStats = async () => {
    try {
      // Sample stats for demonstration
      setStats({
        totalStudents: uniqueUsers.length || 15,
        totalFees: 149985,
        totalCertificates: 8,
        totalNotes: 12,
        totalQuizzes: 6,
        totalVideos: 18,
        activeStudents: 12,
        completionRate: 65
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalStudents: 0,
        totalFees: 0,
        totalCertificates: 0,
        totalNotes: 0,
        totalQuizzes: 0,
        totalVideos: 0,
        activeStudents: 0,
        completionRate: 0
      });
    }
  };

  const fetchAllData = async () => {
    try {
      // Sample data for demonstration
      setVideos([]);
      setNotes([]);
      setQuizzes([]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setVideos([]);
      setNotes([]);
      setQuizzes([]);
    }
  };

  const fetchChartData = async () => {
    try {
      // Sample chart data
      setChartData({
        courses: [],
        studentsPerCourse: [],
        notesPerCourse: [],
        quizzesPerCourse: [],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({
        courses: [],
        studentsPerCourse: [],
        notesPerCourse: [],
        quizzesPerCourse: [],
      });
    }
  };

  const fetchStudents = async () => {
    try {
      setStudents([]);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      setStudentProgress([]);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      setStudentProgress([]);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setFeedbacks([]);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setFeedbacks([]);
    }
  };

  const fetchUserData = () => {
    try {
      const logs = getUserLoginLogs();
      const uniqueUsersData = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
      const stats = getUserStatistics();
      
      setUserLogs(Array.isArray(logs) ? logs : []);
      setUniqueUsers(Array.isArray(uniqueUsersData) ? uniqueUsersData : []);
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchStudentReviews = async () => {
    try {
      // Sample reviews for demonstration
      const sampleReviews = [
        {
          _id: 'review_1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          courseTitle: 'Clinical Research Fundamentals',
          rating: 5,
          reviewText: 'Excellent course! Very comprehensive and well-structured.',
          createdAt: new Date().toISOString(),
          anonymous: false
        },
        {
          _id: 'review_2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          courseTitle: 'Bioinformatics for Beginners',
          rating: 4,
          reviewText: 'Great content and knowledgeable instructors.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          anonymous: false
        }
      ];
      
      setStudentReviews(sampleReviews);
      calculateReviewStats(sampleReviews);
      
    } catch (error) {
      console.error("❌ Error fetching student reviews:", error);
      setStudentReviews([]);
      calculateReviewStats([]);
    }
  };

  const calculateReviewStats = (reviews) => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      setReviewStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const validReviews = reviews.filter(review => review && typeof review.rating === 'number');
    const total = validReviews.length;
    const sum = validReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    const average = total > 0 ? (sum / total).toFixed(1) : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    validReviews.forEach(review => {
      const rating = review.rating || 0;
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });

    setReviewStats({
      totalReviews: total,
      averageRating: parseFloat(average),
      ratingDistribution: distribution
    });
  };

  const fetchCertificateStats = () => {
    try {
      // Sample certificate data
      const sampleCertificates = [
        {
          id: 'cert_1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          courseId: 'course_1',
          courseTitle: 'Clinical Research Fundamentals',
          issueDate: new Date().toISOString()
        }
      ];

      setCertificateStats({
        totalIssued: sampleCertificates.length,
        byCourse: { 'course_1': 1 },
        recentCertificates: sampleCertificates
      });

    } catch (error) {
      console.error("Error fetching certificate stats:", error);
      setCertificateStats({
        totalIssued: 0,
        byCourse: {},
        recentCertificates: []
      });
    }
  };

  // ========== DASHBOARD CHARTS ==========

  const renderDashboardCharts = () => {
    return (
      <div className="admin-charts-section">
        <div className="admin-chart-card">
          <h3>Platform Activities</h3>
          <div className="admin-chart-container">
            <Bar 
              data={{
                labels: ['Logins', 'Enrollments', 'Video Views', 'Quiz Completions'],
                datasets: [
                  {
                    label: 'Activities',
                    data: [activityStats.todayActivities, pendingApprovals.length, 15, 8],
                    backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="admin-chart-card">
          <h3>User Engagement</h3>
          <div className="admin-chart-container">
            <Doughnut 
              data={{
                labels: ['Active Users', 'Inactive Users'],
                datasets: [
                  {
                    data: [activityStats.userEngagement, 100 - activityStats.userEngagement],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.7)',
                      'rgba(239, 68, 68, 0.7)'
                    ],
                    borderColor: [
                      'rgba(34, 197, 94, 1)',
                      'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ========== USE EFFECT ==========

  useEffect(() => {
    // Load courses first
    loadCourses();
    
    // Then load other data
    fetchStats();
    fetchAllData();
    fetchChartData();
    fetchStudents();
    fetchStudentProgress();
    fetchFeedbacks();
    fetchUserData();
    fetchStudentReviews();
    fetchPaymentHistory();
    fetchActivityData();
    fetchCertificateStats();
    fetchPendingApprovals();

    const interval = setInterval(() => {
      fetchActivityData();
      fetchCertificateStats();
      fetchStudentReviews();
      fetchPendingApprovals();
      fetchPaymentHistory();
      setLastUpdate(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ========== MAIN RENDER FUNCTION ==========

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
        {/* Sidebar */}
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

            <li className={`admin-menu-item ${activeTab === 'students' && !viewingQuiz ? 'active' : ''}`}>
              <button onClick={() => { setActiveTab('students'); setViewingQuiz(null); }}>
                <span className="admin-menu-icon">👥</span>
                <span>Students</span>
              </button>
            </li>
            
            {/* Updated Menu Item - Activity Tracking instead of Progress Tracking */}
            <li className={`admin-menu-item ${activeTab === 'progress' && !viewingQuiz ? 'active' : ''}`}>
              <button onClick={() => { setActiveTab('progress'); setViewingQuiz(null); }}>
                <span className="admin-menu-icon">📈</span>
                <span>Activity Tracking</span>
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

        {/* Main Content */}
        <main className="admin-content">
          {/* Quiz View Full Page - Simplified for this example */}
          {viewingQuiz ? (
            <div className="admin-quiz-view">
              <div className="admin-page-header">
                <div className="admin-page-header-left">
                  <button 
                    className="admin-btn secondary back-btn"
                    onClick={() => setViewingQuiz(null)}
                  >
                    ← Back to Quizzes
                  </button>
                  <h1 className="admin-page-title">{viewingQuiz.title || 'Unknown Quiz'}</h1>
                </div>
              </div>
              <div className="quiz-view-content">
                <p>Quiz details view would be displayed here.</p>
              </div>
            </div>
          ) : (
            /* Regular Dashboard Content when not viewing a quiz */
            <>
              {/* Dashboard Overview */}
              {activeTab === 'dashboard' && (
                <div className="admin-dashboard-overview">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Dashboard Overview</h1>
                    <div className="admin-date-filter">
                      <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  {/* Approval Alert Banner */}
                  {approvalStats.pending > 0 && (
                    <div className="approval-alert-banner">
                      <div className="alert-content">
                        <span className="alert-icon">⏳</span>
                        <div className="alert-text">
                          <strong>{approvalStats.pending} enrollments pending approval</strong>
                          <span>Click here to review and approve student enrollments</span>
                        </div>
                      </div>
                      <button 
                        className="admin-btn primary"
                        onClick={() => setActiveTab('approvals')}
                      >
                        Review Now
                      </button>
                    </div>
                  )}
                  
                  {/* Stats Cards */}
                  <div className="admin-stats-grid">
                    <div className="admin-stat-card primary">
                      <div className="admin-stat-icon">👥</div>
                      <div className="admin-stat-content">
                        <h3>Total Students</h3>
                        <p className="admin-stat-number">{userStats.uniqueUsers || 15}</p>
                        <span className="admin-stat-change positive">Registered users</span>
                      </div>
                    </div>
                    <div className="admin-stat-card success">
                      <div className="admin-stat-icon">💰</div>
                      <div className="admin-stat-content">
                        <h3>Total Revenue</h3>
                        <p className="admin-stat-number">₹{formatNumber(stats.totalFees)}</p>
                        <span className="admin-stat-change positive">+12% from last month</span>
                      </div>
                    </div>
                    <div className="admin-stat-card warning">
                      <div className="admin-stat-icon">📜</div>
                      <div className="admin-stat-content">
                        <h3>Certificates Issued</h3>
                        <p className="admin-stat-number">{certificateStats.totalIssued}</p>
                        <span className="admin-stat-change positive">Course completions</span>
                      </div>
                    </div>
                    <div className="admin-stat-card info">
                      <div className="admin-stat-icon">📊</div>
                      <div className="admin-stat-content">
                        <h3>Active Today</h3>
                        <p className="admin-stat-number">{activityStats.todayActivities}</p>
                        <span className="admin-stat-change positive">Platform activities</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Charts Section */}
                  {renderDashboardCharts()}

                  {/* Recent Activity */}
                  <div className="admin-recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="admin-activity-list">
                      {activityData.slice(0, 5).map((activity, index) => (
                        activity && (
                          <div key={activity.id || index} className="admin-activity-item">
                            <div className="activity-icon">{activity.icon}</div>
                            <div className="activity-details">
                              <strong>{activity.userName}</strong>
                              <span>{activity.description}</span>
                            </div>
                            <div className="activity-time">
                              {getTimeAgo(activity.timestamp)}
                            </div>
                          </div>
                        )
                      ))}
                      {activityData.length === 0 && (
                        <div className="admin-empty-message">
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Course Management Section */}
              {activeTab === 'courses' && renderCourseManagement()}

              {/* Approval Dashboard Section */}
              {activeTab === 'approvals' && renderApprovalDashboard()}

              {/* Student Management - Simplified */}
              {activeTab === 'students' && (
                <div className="admin-students">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Student Management</h1>
                  </div>
                  <div className="admin-stats-grid">
                    <div className="admin-stat-card primary">
                      <div className="admin-stat-icon">👥</div>
                      <div className="admin-stat-content">
                        <h3>{userStats.uniqueUsers || 15}</h3>
                        <p>Total Users</p>
                        <span className="admin-stat-change positive">Registered users</span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-table-card">
                    <p>Student management interface would be displayed here.</p>
                  </div>
                </div>
              )}

              {/* Activity Tracking - REPLACED Progress Tracking */}
              {activeTab === 'progress' && renderActivityTracking()}

              {/* Student Feedback - Simplified */}
              {activeTab === 'feedbacks' && (
                <div className="admin-feedbacks">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Student Feedback & Reviews</h1>
                  </div>
                  <div className="admin-stats-grid">
                    <div className="admin-stat-card primary">
                      <div className="admin-stat-icon">⭐</div>
                      <div className="admin-stat-content">
                        <h3>{reviewStats.averageRating}</h3>
                        <p>Average Rating</p>
                        <span className="admin-stat-change positive">Out of 5.0</span>
                      </div>
                    </div>
                    <div className="admin-stat-card success">
                      <div className="admin-stat-icon">💬</div>
                      <div className="admin-stat-content">
                        <h3>{reviewStats.totalReviews}</h3>
                        <p>Total Reviews</p>
                        <span className="admin-stat-change positive">All courses</span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-table-card">
                    <p>Student reviews and feedback interface would be displayed here.</p>
                  </div>
                </div>
              )}

              {/* Payment Details Section - COMPLETE */}
              {activeTab === 'payment-details' && renderPaymentDetails()}

              {/* Content Management Sections - Simplified */}
              {activeTab === 'videos' && (
                <div className="admin-content-management">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Video Management</h1>
                  </div>
                  <div className="admin-table-card">
                    <p>Video management interface would be displayed here.</p>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="admin-content-management">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Note Management</h1>
                  </div>
                  <div className="admin-table-card">
                    <p>Note management interface would be displayed here.</p>
                  </div>
                </div>
              )}

              {activeTab === 'quizzes' && (
                <div className="admin-content-management">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Quiz Management</h1>
                  </div>
                  <div className="admin-table-card">
                    <p>Quiz management interface would be displayed here.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Course Sidebar */}
      {renderCourseSidebar()}

      {/* Approval Sidebar */}
      {renderApprovalSidebar()}

      {/* Enrollment Details Modal */}
      {renderEnrollmentDetailsModal()}

      {/* Payment Modal */}
      {renderPaymentModal()}
    </div>
  );
}

export default AdminDashboard;