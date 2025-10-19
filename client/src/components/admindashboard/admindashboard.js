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

  // ========== NEW PROGRESS TRACKING STATE ==========
  const [studentProgress, setStudentProgress] = useState([]);
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);
  const [progressStats, setProgressStats] = useState({
    totalStudents: 0,
    totalEnrollments: 0,
    totalCompletedCourses: 0,
    averageProgress: 0
  });

  // ========== MISSING FUNCTIONS ==========

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

  const getFilteredReviews = () => {
    return studentReviews.filter(review => {
      if (!review) return false;
      
      const matchesCourse = reviewFilters.course === 'all' || review.courseId === reviewFilters.course || review.courseTitle === reviewFilters.course;
      const matchesRating = reviewFilters.rating === 'all' || review.rating === parseInt(reviewFilters.rating);
      const matchesSearch = reviewFilters.search === '' || 
        (review.userName && review.userName.toLowerCase().includes(reviewFilters.search.toLowerCase())) ||
        (review.reviewText && review.reviewText.toLowerCase().includes(reviewFilters.search.toLowerCase())) ||
        (review.courseTitle && review.courseTitle.toLowerCase().includes(reviewFilters.search.toLowerCase()));
      const matchesReply = reviewFilters.hasReply === 'all' || 
        (reviewFilters.hasReply === 'replied' && review.adminReply) ||
        (reviewFilters.hasReply === 'not-replied' && !review.adminReply);
      
      return matchesCourse && matchesRating && matchesSearch && matchesReply;
    });
  };

  const handleReviewFilterChange = (filterType, value) => {
    setReviewFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getUniqueCoursesFromReviews = () => {
    const courses = studentReviews
      .map(review => review && review.courseTitle)
      .filter(Boolean);
    return [...new Set(courses)];
  };

  const getRecentReviews = () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return studentReviews.filter(review => {
      if (!review) return false;
      const reviewDate = new Date(review.createdAt || review.date || review.timestamp);
      return reviewDate > twentyFourHoursAgo;
    });
  };

  const handleRefreshReviews = () => {
    fetchStudentReviews();
    setLastUpdate(Date.now());
    alert("🔄 Reviews refreshed successfully!");
  };

  const simulateUserReview = () => {
    const testUsers = [
      { name: "John Doe", email: "john@example.com" },
      { name: "Jane Smith", email: "jane@example.com" },
      { name: "Mike Johnson", email: "mike@example.com" },
      { name: "Sarah Wilson", email: "sarah@example.com" }
    ];
    
    const reviews = [
      "Excellent course! The content was very comprehensive and well-structured. I learned so much about clinical research methodologies.",
      "Great learning experience. The instructor was very knowledgeable and provided practical insights that I can apply in my work.",
      "Loved the practical examples and real-world applications. The course material was engaging and easy to follow.",
      "The course material was up-to-date and relevant to current industry standards. Highly recommended for professionals.",
      "Very informative and engaging. Would recommend to others looking to advance their career in healthcare.",
      "The quizzes helped reinforce the learning concepts effectively. The assessments were challenging but fair.",
      "Excellent support from the instructors. They were always available to answer questions and provide guidance.",
      "The course exceeded my expectations. The depth of content and quality of instruction were outstanding.",
      "Well-structured curriculum with a good balance of theory and practical applications.",
      "The online platform was easy to use and the course materials were well-organized."
    ];
    
    const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
    const randomCourse = courses[Math.floor(Math.random() * courses.length)];
    const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
    const randomRating = Math.floor(Math.random() * 5) + 1;
    
    const newReview = {
      _id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userName: randomUser.name,
      userEmail: randomUser.email,
      courseId: randomCourse._id,
      courseTitle: randomCourse.title,
      rating: randomRating,
      reviewText: randomReview,
      createdAt: new Date().toISOString(),
      anonymous: Math.random() > 0.8,
      timestamp: Date.now()
    };
    
    const userKey = `userReviews_${randomUser.email.replace(/[@.]/g, '_')}`;
    const userExistingReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
    userExistingReviews.push(newReview);
    localStorage.setItem(userKey, JSON.stringify(userExistingReviews));
    
    const centralizedReviews = JSON.parse(localStorage.getItem('allStudentReviews') || '[]');
    centralizedReviews.unshift(newReview);
    localStorage.setItem('allStudentReviews', JSON.stringify(centralizedReviews));
    
    setStudentReviews(prev => [newReview, ...prev]);
    calculateReviewStats([newReview, ...studentReviews]);
    
    alert(`✅ Test review submitted by ${randomUser.name} for ${randomCourse.title}`);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const centralizedReviews = JSON.parse(localStorage.getItem('allStudentReviews') || '[]');
        const updatedCentralized = centralizedReviews.filter(review => review && review._id !== reviewId);
        localStorage.setItem('allStudentReviews', JSON.stringify(updatedCentralized));
        
        const reviewToDelete = studentReviews.find(review => review && review._id === reviewId);
        if (reviewToDelete && reviewToDelete.userEmail) {
          const userKey = `userReviews_${reviewToDelete.userEmail.replace(/[@.]/g, '_')}`;
          const userReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
          const updatedUserReviews = userReviews.filter(review => review && review._id !== reviewId);
          localStorage.setItem(userKey, JSON.stringify(updatedUserReviews));
        }
        
        const updatedReviews = studentReviews.filter(review => review && review._id !== reviewId);
        setStudentReviews(updatedReviews);
        calculateReviewStats(updatedReviews);
        
        alert("✅ Review deleted successfully!");
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("❌ Failed to delete review. Please try again.");
      }
    }
  };

  const handleReplyToReview = (reviewId, studentName) => {
    const review = studentReviews.find(r => r && r._id === reviewId);
    if (!review) return;
    
    const currentReply = review?.adminReply || '';
    
    const reply = prompt(`Enter your reply to ${studentName}'s review:`, currentReply);
    if (reply !== null) {
      const updatedReviews = studentReviews.map(review => 
        review && review._id === reviewId 
          ? { 
              ...review, 
              adminReply: reply, 
              replyDate: new Date().toISOString(),
              repliedBy: 'Admin',
              replyTimestamp: Date.now()
            }
          : review
      );
      
      localStorage.setItem('allStudentReviews', JSON.stringify(updatedReviews));
      
      const reviewToUpdate = studentReviews.find(review => review && review._id === reviewId);
      if (reviewToUpdate && reviewToUpdate.userEmail) {
        const userKey = `userReviews_${reviewToUpdate.userEmail.replace(/[@.]/g, '_')}`;
        const userReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
        const updatedUserReviews = userReviews.map(review => 
          review && review._id === reviewId 
            ? { ...review, adminReply: reply, replyDate: new Date().toISOString() }
            : review
        );
        localStorage.setItem(userKey, JSON.stringify(updatedUserReviews));
      }
      
      setStudentReviews(updatedReviews);
      alert("✅ Reply added successfully!");
    }
  };

  const handleToggleFeatured = (reviewId) => {
    const updatedReviews = studentReviews.map(review => {
      if (review && review._id === reviewId) {
        return { 
          ...review, 
          isFeatured: !review.isFeatured,
          featuredDate: !review.isFeatured ? new Date().toISOString() : null
        };
      }
      return review;
    });
    
    localStorage.setItem('allStudentReviews', JSON.stringify(updatedReviews));
    
    setStudentReviews(updatedReviews);
    
    const review = studentReviews.find(r => r && r._id === reviewId);
    if (review) {
      alert(`✅ Review ${review.isFeatured ? 'unfeatured' : 'featured'} successfully!`);
    }
  };

  const handleClearAllReviews = () => {
    if (window.confirm("Are you sure you want to delete ALL reviews? This action cannot be undone.")) {
      try {
        localStorage.removeItem('allStudentReviews');
        
        const uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
        uniqueUsers.forEach(user => {
          if (user) {
            const userKey = `userReviews_${user.replace(/[@.]/g, '_')}`;
            localStorage.removeItem(userKey);
          }
        });
        
        localStorage.removeItem('studentReviews');
        
        setStudentReviews([]);
        calculateReviewStats([]);
        
        alert("✅ All reviews have been cleared!");
      } catch (error) {
        console.error("Error clearing reviews:", error);
        alert("❌ Failed to clear reviews. Please try again.");
      }
    }
  };

  const getFilteredPayments = () => {
    return paymentHistory.filter(payment => {
      if (!payment) return false;
      
      const matchesMethod = paymentFilters.paymentMethod === 'all' || payment.paymentMethod === paymentFilters.paymentMethod;
      const matchesSearch = paymentFilters.search === '' || 
        (payment.userName && payment.userName.toLowerCase().includes(paymentFilters.search.toLowerCase())) ||
        (payment.courseTitle && payment.courseTitle.toLowerCase().includes(paymentFilters.search.toLowerCase())) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(paymentFilters.search.toLowerCase()));
      
      return matchesMethod && matchesSearch;
    });
  };

  const handleFilterChange = (filterType, value) => {
    setPaymentFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const calculatePaymentStats = () => {
    const totalRevenue = paymentHistory.reduce((sum, payment) => {
      if (!payment || !payment.amount) return sum;
      const amount = parseInt(payment.amount.replace(/[^0-9]/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const completedPayments = paymentHistory.length;
    const uniqueStudents = new Set(paymentHistory.map(p => p && p.userId).filter(Boolean)).size;
    const paymentMethods = new Set(paymentHistory.map(p => p && p.paymentMethod).filter(Boolean)).size;

    return {
      totalRevenue,
      completedPayments,
      uniqueStudents,
      paymentMethods
    };
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
              <span class="detail-label">Date:</span>
              <span class="detail-value">${payment.date ? new Date(payment.date).toLocaleDateString() : 'Unknown date'}</span>
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
              <span class="detail-value">${payment.paymentMethod || 'N/A'}</span>
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

  const renderPaymentModal = () => {
    if (!showPaymentModal || !selectedPayment) return null;

    return (
      <div className="admin-modal-overlay">
        <div className="admin-modal">
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
              <h3>Transaction Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Transaction ID:</span>
                  <span className="admin-detail-value">{selectedPayment.transactionId || 'N/A'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Date & Time:</span>
                  <span className="admin-detail-value">
                    {selectedPayment.date ? new Date(selectedPayment.date).toLocaleString() : 'Unknown date'}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Payment Method:</span>
                  <span className="admin-detail-value">{selectedPayment.paymentMethod || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>Course Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Course:</span>
                  <span className="admin-detail-value">{selectedPayment.courseTitle || 'Unknown Course'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Course ID:</span>
                  <span className="admin-detail-value">{selectedPayment.courseId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>Student Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student Name:</span>
                  <span className="admin-detail-value">{selectedPayment.userName || 'Unknown Student'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="detail-label">Student Email:</span>
                  <span className="detail-value">{selectedPayment.userEmail || 'No email'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student ID:</span>
                  <span className="admin-detail-value">{selectedPayment.userId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>Payment Amount</h3>
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

  const renderPaymentDetails = () => {
    const filteredPayments = getFilteredPayments();
    const paymentStats = calculatePaymentStats();

    return (
      <div className="admin-payment-details">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Payment Details & Receipts</h1>
          <p>Manage and view all payment transactions</p>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card primary">
            <div className="admin-stat-icon">💰</div>
            <div className="admin-stat-content">
              <h3>₹{formatNumber(paymentStats.totalRevenue)}</h3>
              <p>Total Revenue</p>
              <span className="admin-stat-change positive">All payments</span>
            </div>
          </div>
          <div className="admin-stat-card success">
            <div className="admin-stat-icon">📊</div>
            <div className="admin-stat-content">
              <h3>{paymentHistory.length}</h3>
              <p>Total Payments</p>
              <span className="admin-stat-change positive">Transactions</span>
            </div>
          </div>
          <div className="admin-stat-card warning">
            <div className="admin-stat-icon">✅</div>
            <div className="admin-stat-content">
              <h3>{paymentStats.completedPayments}</h3>
              <p>Completed</p>
              <span className="admin-stat-change positive">Successful</span>
            </div>
          </div>
          <div className="admin-stat-card info">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-content">
              <h3>{paymentStats.uniqueStudents}</h3>
              <p>Paid Students</p>
              <span className="admin-stat-change positive">Unique</span>
            </div>
          </div>
        </div>

        <div className="admin-payment-filters">
          <div className="admin-search-box">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by student, course, or transaction ID..."
              className="admin-search-input"
              value={paymentFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="admin-filter-group">
            <label>Payment Method</label>
            <select 
              className="admin-filter-select"
              value={paymentFilters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>

        {filteredPayments.length > 0 ? (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  payment && (
                    <tr key={payment.id || index} className="admin-payment-row">
                      <td className="admin-payment-date">
                        {payment.date ? new Date(payment.date).toLocaleDateString() : 'Unknown date'}
                      </td>
                      <td className="admin-payment-student">
                        <div>
                          <strong>{payment.userName || 'Unknown Student'}</strong>
                          <div style={{fontSize: '12px', color: '#666'}}>
                            {payment.userEmail || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="admin-payment-course">
                        <strong>{payment.courseTitle || 'Unknown Course'}</strong>
                      </td>
                      <td className="admin-payment-amount">
                        <span className="admin-amount-badge">{payment.amount || 'N/A'}</span>
                      </td>
                      <td className="admin-payment-method">
                        <span className={`admin-method-badge ${payment.paymentMethod}`}>
                          {payment.paymentMethod === 'razorpay' ? '💳 Razorpay' : payment.paymentMethod || 'N/A'}
                        </span>
                      </td>
                      <td className="admin-payment-actions">
                        <button 
                          onClick={() => viewPaymentDetails(payment)}
                          className="admin-btn action view"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => downloadReceipt(payment)}
                          className="admin-btn action primary"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-message">
            <div className="admin-empty-icon">💳</div>
            <h3>No Payments Found</h3>
            <p>No payment records match your current filters.</p>
            <button 
              onClick={() => setPaymentFilters({ paymentMethod: 'all', search: '' })}
              className="admin-btn primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  };

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

  // ========== NEW PROGRESS TRACKING FUNCTIONS ==========

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

  // ========== NEW PROGRESS TRACKING COMPONENT ==========

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

  // ========== OTHER EXISTING FUNCTIONS ==========

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/stats`);
      setStats(res.data);
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
      const [videoRes, noteRes, quizRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/videos`),
        axios.get(`${API_BASE_URL}/api/admin/notes`),
        axios.get(`${API_BASE_URL}/api/admin/quizzes`),
      ]);
      setVideos(videoRes.data);
      setNotes(noteRes.data);
      setQuizzes(quizRes.data);
      
      setStats(prevStats => ({
        ...prevStats,
        totalVideos: videoRes.data.length,
        totalNotes: noteRes.data.length,
        totalQuizzes: quizRes.data.length
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setVideos([]);
      setNotes([]);
      setQuizzes([]);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/chart-data`);
      setChartData(res.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({
        courses: [],
        studentsPerCourse: [],
        notesPerCourse: [],
        quizzesPerCourse: [],
        monthlyRevenue: [],
        monthlyStudents: [],
        engagementRate: []
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/students`);
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/feedbacks`);
      setFeedbacks(res.data);
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
      console.log("🔄 Fetching student reviews from user dashboard...");
      
      let allReviews = [];
      
      const centralizedReviews = localStorage.getItem('allStudentReviews');
      if (centralizedReviews) {
        try {
          const parsedReviews = JSON.parse(centralizedReviews);
          console.log("📊 Found centralized reviews:", parsedReviews.length);
          allReviews = Array.isArray(parsedReviews) ? parsedReviews : [];
        } catch (parseError) {
          console.error("Error parsing centralized reviews:", parseError);
          allReviews = [];
        }
      }
      
      const sortedReviews = allReviews.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      console.log("🎯 Final reviews to display:", sortedReviews.length);
      setStudentReviews(sortedReviews);
      calculateReviewStats(sortedReviews);
      
    } catch (error) {
      console.error("❌ Error fetching student reviews:", error);
      setStudentReviews([]);
      calculateReviewStats([]);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/payments`);
        if (response.data && response.data.length > 0) {
          console.log("💰 Payments from API:", response.data);
          setPaymentHistory(response.data);
          return;
        }
      } catch (apiError) {
        console.log("Payment API not available, checking localStorage");
      }

      const userPaymentHistory = localStorage.getItem('userPaymentHistory');
      if (userPaymentHistory) {
        try {
          const payments = JSON.parse(userPaymentHistory);
          console.log("💰 Payments from localStorage:", payments);
          setPaymentHistory(Array.isArray(payments) ? payments : []);
        } catch (parseError) {
          console.error("Error parsing payment history:", parseError);
          setPaymentHistory([]);
        }
      } else {
        const samplePayments = [
          {
            id: 'payment_1',
            userId: 'user_1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            courseId: '1',
            courseTitle: 'Clinical Research',
            amount: '₹1.00',
            paymentMethod: 'razorpay',
            date: new Date('2024-01-15').toISOString(),
            transactionId: 'TXN_0012345678',
            receiptUrl: '#'
          }
        ];
        setPaymentHistory(samplePayments);
        console.log("💰 Using sample payment data");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPaymentHistory([]);
    }
  };

  const fetchCertificateStats = () => {
    try {
      let totalIssued = 0;
      const byCourse = {};
      const recentCertificates = [];

      studentProgress.forEach(student => {
        if (student.certificates && student.certificates === '✅ Certificate Generated') {
          totalIssued++;
          byCourse[student.courseId] = (byCourse[student.courseId] || 0) + 1;
          
          recentCertificates.push({
            courseId: student.courseId,
            courseTitle: student.enrolledCourse,
            userName: student.userName,
            userEmail: student.userEmail,
            issueDate: new Date().toISOString()
          });
        }
      });

      setCertificateStats({
        totalIssued,
        byCourse,
        recentCertificates: recentCertificates.slice(0, 10)
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
    const courseEnrollmentsData = {
      labels: courses.map(course => course.title),
      datasets: [
        {
          label: 'Enrollments',
          data: courses.map(course => 
            studentProgress.filter(student => student.courseId === course._id).length
          ),
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
        }
      ]
    };

    const progressDistributionData = {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [
        {
          data: [
            progressStats.totalCompletedCourses,
            progressStats.totalEnrollments - progressStats.totalCompletedCourses,
            progressStats.totalStudents - progressStats.totalEnrollments
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };

    return (
      <div className="admin-charts-section">
        <div className="admin-chart-card">
          <h3>Course Enrollment</h3>
          <div className="admin-chart-container">
            <Bar 
              data={courseEnrollmentsData}
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
          <h3>Student Progress Overview</h3>
          <div className="admin-chart-container">
            <Doughnut 
              data={progressDistributionData}
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

        <div className="admin-chart-card">
          <h3>Monthly Activity</h3>
          <div className="admin-chart-container">
            <Line 
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Learning Progress',
                    data: [65, 59, 80, 81, 56, 72],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                  }
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
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN COMPONENT RENDER ==========

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

        {/* Main Content */}
        <main className="admin-content">
          {/* Quiz View Full Page */}
          {viewingQuiz ? (
            <div className="admin-quiz-view">
              {/* Your existing quiz view code */}
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
                <p>Quiz details view - implement as needed</p>
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
                        <p className="admin-stat-number">{userStats.uniqueUsers}</p>
                        <span className="admin-stat-change positive">Real users registered</span>
                      </div>
                    </div>
                    <div className="admin-stat-card success">
                      <div className="admin-stat-icon">💰</div>
                      <div className="admin-stat-content">
                        <h3>Total Revenue</h3>
                        <p className="admin-stat-number">₹{formatNumber(stats.totalFees)}</p>
                        <span className="admin-stat-change positive">+8% from last month</span>
                      </div>
                    </div>
                    <div className="admin-stat-card warning">
                      <div className="admin-stat-icon">📜</div>
                      <div className="admin-stat-content">
                        <h3>Certificates Issued</h3>
                        <p className="admin-stat-number">{certificateStats.totalIssued}</p>
                        <span className="admin-stat-change positive">Real certificates</span>
                      </div>
                    </div>
                    <div className="admin-stat-card info">
                      <div className="admin-stat-icon">📊</div>
                      <div className="admin-stat-content">
                        <h3>Active Today</h3>
                        <p className="admin-stat-number">{userStats.todayLogins}</p>
                        <span className="admin-stat-change positive">Today's logins</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Charts Section */}
                  {renderDashboardCharts()}

                  {/* Recent Activity */}
                  <div className="admin-recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="admin-activity-list">
                      {userLogs.slice(0, 5).map((log, index) => (
                        log && (
                          <div key={index} className="admin-activity-item">
                            <div className="activity-icon">👤</div>
                            <div className="activity-details">
                              <strong>{log.name || log.email || 'Unknown User'}</strong>
                              <span>Logged in</span>
                            </div>
                            <div className="activity-time">
                              {getTimeAgo(log.timestamp)}
                            </div>
                          </div>
                        )
                      ))}
                      {userLogs.length === 0 && (
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

              {/* Progress Tracking Section */}
              {activeTab === 'progress' && renderProgressTracking()}

              {/* Student Management Section */}
              {activeTab === 'students' && (
                <div className="admin-students-management">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Student Management</h1>
                    <p>Manage student accounts and information</p>
                  </div>
                  {/* Add your student management content here */}
                </div>
              )}

              {/* Student Feedback Section */}
              {activeTab === 'feedbacks' && (
                <div className="admin-feedbacks">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Student Feedback</h1>
                    <p>View and manage student reviews and feedback</p>
                  </div>
                  {/* Add your feedback content here */}
                </div>
              )}

              {/* Payment Details Section */}
              {activeTab === 'payment-details' && renderPaymentDetails()}

              {/* Video Management Section */}
              {activeTab === 'videos' && (
                <div className="admin-videos">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Video Management</h1>
                    <p>Upload and manage course videos</p>
                  </div>
                  {/* Add your videos content here */}
                </div>
              )}

              {/* Notes Management Section */}
              {activeTab === 'notes' && (
                <div className="admin-notes">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Notes Management</h1>
                    <p>Upload and manage course notes</p>
                  </div>
                  {/* Add your notes content here */}
                </div>
              )}

              {/* Quiz Management Section */}
              {activeTab === 'quizzes' && (
                <div className="admin-quizzes">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Quiz Management</h1>
                    <p>Create and manage course quizzes</p>
                  </div>
                  {/* Add your quizzes content here */}
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

      {/* Student Progress Details Modal */}
      {renderStudentProgressDetails()}

      {/* Payment Modal */}
      {renderPaymentModal()}
    </div>
  );
}

export default AdminDashboard;