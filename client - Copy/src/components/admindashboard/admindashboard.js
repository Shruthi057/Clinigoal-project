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

// Default courses data
const defaultCourses = [
  {
    _id: '1',
    title: "Clinical Research",
    description: "Comprehensive training in clinical research methodologies, regulatory affairs, and clinical trial management.",
    instructor: "Dr. Ananya Sharma",
    duration: "12 weeks",
    level: "Advanced",
    price: "₹89,999",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: [
      "Regulatory Compliance Training",
      "Clinical Trial Management",
      "ICH-GCP Guidelines",
      "Case Studies & Projects"
    ]
  },
  {
    _id: '2',
    title: "Bioinformatics",
    description: "Master the intersection of biology, computer science, and statistics to analyze biological data.",
    instructor: "Prof. Rajiv Menon",
    duration: "16 weeks",
    level: "Intermediate",
    price: "₹1,19,999",
    image: "https://images.unsplash.com/photo-1581091226835-a8a0058f0a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: [
      "Genomic Data Analysis",
      "Protein Structure Prediction",
      "Sequence Alignment",
      "Molecular Modeling"
    ]
  },
  {
    _id: '3',
    title: "Medical Coding",
    description: "Learn medical terminology, coding systems, and billing procedures for healthcare settings.",
    instructor: "Ms. Priya Nair",
    duration: "10 weeks",
    level: "Beginner",
    price: "₹74,999",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: [
      "ICD-10 Coding",
      "CPT Coding",
      "Medical Billing",
      "Healthcare Compliance"
    ]
  },
  {
    _id: '4',
    title: "Pharmacovigilance",
    description: "Specialized training in drug safety monitoring, adverse event reporting, and risk management.",
    instructor: "Dr. Vikram Patel",
    duration: "14 weeks",
    level: "Advanced",
    price: "₹94,999",
    image: "https://images.unsplash.com/photo-1581091226835-a8a0058f0a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: [
      "Adverse Drug Reactions",
      "Signal Detection",
      "Risk Management",
      "Regulatory Reporting"
    ]
  }
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

  // Student Reviews State - ENHANCED
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
    status: 'all',
    paymentMethod: 'all',
    search: ''
  });

  // For editing
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // NEW: State for real-time updates
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [reviewFilters, setReviewFilters] = useState({
    course: 'all',
    rating: 'all',
    search: '',
    hasReply: 'all'
  });

  useEffect(() => {
    fetchStats();
    fetchAllData();
    fetchChartData();
    fetchStudents();
    fetchStudentProgress();
    fetchFeedbacks();
    fetchUserData();
    fetchStudentReviews();
    fetchPaymentHistory();

    // NEW: Set up real-time interval for checking new reviews
    const interval = setInterval(() => {
      fetchStudentReviews();
      setLastUpdate(Date.now());
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // NEW: Enhanced function to fetch student reviews from user dashboard storage
  const fetchStudentReviews = async () => {
    try {
      console.log("🔄 Fetching student reviews from user dashboard...");
      
      let allReviews = [];
      
      // Method 1: Check centralized reviews storage first
      const centralizedReviews = localStorage.getItem('allStudentReviews');
      if (centralizedReviews) {
        const parsedReviews = JSON.parse(centralizedReviews);
        console.log("📊 Found centralized reviews:", parsedReviews.length);
        allReviews = parsedReviews;
      } else {
        // Method 2: Collect reviews from all user storages
        console.log("🔍 Searching for user review data...");
        
        // Get all users from localStorage
        const uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
        const userLoginLogs = JSON.parse(localStorage.getItem('userLoginLogs') || '[]');
        
        // Collect reviews from all users
        for (const user of uniqueUsers) {
          try {
            const userKey = `userReviews_${user.replace(/[@.]/g, '_')}`;
            const userReviews = localStorage.getItem(userKey);
            
            if (userReviews) {
              const reviews = JSON.parse(userReviews);
              console.log(`👤 Found ${reviews.length} reviews for user: ${user}`);
              
              // Add user info to each review
              const userInfo = userLoginLogs.find(log => log.email === user);
              const enrichedReviews = reviews.map(review => ({
                ...review,
                _id: review._id || `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userName: review.userName || userInfo?.name || user.split('@')[0] || 'Anonymous',
                userEmail: review.userEmail || user,
                createdAt: review.createdAt || review.date || new Date().toISOString(),
                rating: review.rating || 0,
                reviewText: review.reviewText || review.comment || 'No review text provided',
                courseTitle: review.courseTitle || review.course || 'Unknown Course',
                anonymous: review.anonymous || false
              }));
              
              allReviews = [...allReviews, ...enrichedReviews];
            }
          } catch (error) {
            console.error(`Error processing reviews for user ${user}:`, error);
          }
        }
        
        // Method 3: Try legacy user dashboard reviews
        const legacyReviews = localStorage.getItem('studentReviews');
        if (legacyReviews) {
          try {
            const reviews = JSON.parse(legacyReviews);
            console.log("📝 Found legacy reviews:", reviews.length);
            allReviews = [...allReviews, ...reviews];
          } catch (error) {
            console.error("Error parsing legacy reviews:", error);
          }
        }
        
        // Save to centralized storage for future use
        if (allReviews.length > 0) {
          localStorage.setItem('allStudentReviews', JSON.stringify(allReviews));
          console.log("💾 Saved to centralized storage:", allReviews.length);
        }
      }
      
      // Sort reviews by date (newest first)
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

  // NEW: Function to get filtered reviews
  const getFilteredReviews = () => {
    return studentReviews.filter(review => {
      const matchesCourse = reviewFilters.course === 'all' || review.courseId === reviewFilters.course || review.courseTitle === reviewFilters.course;
      const matchesRating = reviewFilters.rating === 'all' || review.rating === parseInt(reviewFilters.rating);
      const matchesSearch = reviewFilters.search === '' || 
        review.userName?.toLowerCase().includes(reviewFilters.search.toLowerCase()) ||
        review.reviewText?.toLowerCase().includes(reviewFilters.search.toLowerCase()) ||
        review.courseTitle?.toLowerCase().includes(reviewFilters.search.toLowerCase());
      const matchesReply = reviewFilters.hasReply === 'all' || 
        (reviewFilters.hasReply === 'replied' && review.adminReply) ||
        (reviewFilters.hasReply === 'not-replied' && !review.adminReply);
      
      return matchesCourse && matchesRating && matchesSearch && matchesReply;
    });
  };

  // NEW: Function to simulate user submitting a review (for testing)
  const simulateUserReview = () => {
    const testUsers = [
      { name: "John Doe", email: "john@example.com" },
      { name: "Jane Smith", email: "jane@example.com" },
      { name: "Mike Johnson", email: "mike@example.com" },
      { name: "Sarah Wilson", email: "sarah@example.com" }
    ];
    
    const courses = defaultCourses;
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
    
    // Create a new review
    const newReview = {
      _id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userName: randomUser.name,
      userEmail: randomUser.email,
      courseId: randomCourse._id,
      courseTitle: randomCourse.title,
      rating: randomRating,
      reviewText: randomReview,
      createdAt: new Date().toISOString(),
      anonymous: Math.random() > 0.8, // 20% chance of being anonymous
      timestamp: Date.now()
    };
    
    // Save to user's review storage (simulating user dashboard behavior)
    const userKey = `userReviews_${randomUser.email.replace(/[@.]/g, '_')}`;
    const userExistingReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
    userExistingReviews.push(newReview);
    localStorage.setItem(userKey, JSON.stringify(userExistingReviews));
    
    // Also update centralized storage
    const centralizedReviews = JSON.parse(localStorage.getItem('allStudentReviews') || '[]');
    centralizedReviews.unshift(newReview); // Add to beginning
    localStorage.setItem('allStudentReviews', JSON.stringify(centralizedReviews));
    
    // Update state
    setStudentReviews(prev => [newReview, ...prev]);
    calculateReviewStats([newReview, ...studentReviews]);
    
    alert(`✅ Test review submitted by ${randomUser.name} for ${randomCourse.title}`);
  };

  // NEW: Function to calculate review statistics
  const calculateReviewStats = (reviews) => {
    if (!reviews || reviews.length === 0) {
      setReviewStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    const average = total > 0 ? (sum / total).toFixed(1) : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
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

  // NEW: Function to delete a review
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        // Remove from centralized storage
        const centralizedReviews = JSON.parse(localStorage.getItem('allStudentReviews') || '[]');
        const updatedCentralized = centralizedReviews.filter(review => review._id !== reviewId);
        localStorage.setItem('allStudentReviews', JSON.stringify(updatedCentralized));
        
        // Also try to remove from user's individual storage
        const reviewToDelete = studentReviews.find(review => review._id === reviewId);
        if (reviewToDelete && reviewToDelete.userEmail) {
          const userKey = `userReviews_${reviewToDelete.userEmail.replace(/[@.]/g, '_')}`;
          const userReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
          const updatedUserReviews = userReviews.filter(review => review._id !== reviewId);
          localStorage.setItem(userKey, JSON.stringify(updatedUserReviews));
        }
        
        // Update state
        const updatedReviews = studentReviews.filter(review => review._id !== reviewId);
        setStudentReviews(updatedReviews);
        calculateReviewStats(updatedReviews);
        
        alert("✅ Review deleted successfully!");
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("❌ Failed to delete review. Please try again.");
      }
    }
  };

  // NEW: Function to reply to a review
  const handleReplyToReview = (reviewId, studentName) => {
    const review = studentReviews.find(r => r._id === reviewId);
    const currentReply = review?.adminReply || '';
    
    const reply = prompt(`Enter your reply to ${studentName}'s review:`, currentReply);
    if (reply !== null) {
      // Update the review with admin reply
      const updatedReviews = studentReviews.map(review => 
        review._id === reviewId 
          ? { 
              ...review, 
              adminReply: reply, 
              replyDate: new Date().toISOString(),
              repliedBy: 'Admin',
              replyTimestamp: Date.now()
            }
          : review
      );
      
      // Update centralized storage
      localStorage.setItem('allStudentReviews', JSON.stringify(updatedReviews));
      
      // Update user's storage if possible
      const reviewToUpdate = studentReviews.find(review => review._id === reviewId);
      if (reviewToUpdate && reviewToUpdate.userEmail) {
        const userKey = `userReviews_${reviewToUpdate.userEmail.replace(/[@.]/g, '_')}`;
        const userReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
        const updatedUserReviews = userReviews.map(review => 
          review._id === reviewId 
            ? { ...review, adminReply: reply, replyDate: new Date().toISOString() }
            : review
        );
        localStorage.setItem(userKey, JSON.stringify(updatedUserReviews));
      }
      
      // Update state
      setStudentReviews(updatedReviews);
      alert("✅ Reply added successfully!");
    }
  };

  // NEW: Function to clear all reviews
  const handleClearAllReviews = () => {
    if (window.confirm("Are you sure you want to delete ALL reviews? This action cannot be undone.")) {
      try {
        // Clear centralized storage
        localStorage.removeItem('allStudentReviews');
        
        // Clear all user review storages
        const uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
        uniqueUsers.forEach(user => {
          const userKey = `userReviews_${user.replace(/[@.]/g, '_')}`;
          localStorage.removeItem(userKey);
        });
        
        // Clear legacy storage
        localStorage.removeItem('studentReviews');
        
        // Update state
        setStudentReviews([]);
        calculateReviewStats([]);
        
        alert("✅ All reviews have been cleared!");
      } catch (error) {
        console.error("Error clearing reviews:", error);
        alert("❌ Failed to clear reviews. Please try again.");
      }
    }
  };

  // NEW: Function to mark review as featured
  const handleToggleFeatured = (reviewId) => {
    const updatedReviews = studentReviews.map(review => {
      if (review._id === reviewId) {
        return { 
          ...review, 
          isFeatured: !review.isFeatured,
          featuredDate: !review.isFeatured ? new Date().toISOString() : null
        };
      }
      return review;
    });
    
    // Update centralized storage
    localStorage.setItem('allStudentReviews', JSON.stringify(updatedReviews));
    
    // Update state
    setStudentReviews(updatedReviews);
    
    const review = studentReviews.find(r => r._id === reviewId);
    if (review) {
      alert(`✅ Review ${review.isFeatured ? 'unfeatured' : 'featured'} successfully!`);
    }
  };

  // NEW: Function to get recent reviews (last 24 hours)
  const getRecentReviews = () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return studentReviews.filter(review => {
      const reviewDate = new Date(review.createdAt || review.date || review.timestamp);
      return reviewDate > twentyFourHoursAgo;
    });
  };

  // NEW: Function to refresh reviews manually
  const handleRefreshReviews = () => {
    fetchStudentReviews();
    setLastUpdate(Date.now());
    alert("🔄 Reviews refreshed successfully!");
  };

  // NEW: Function to handle review filter changes
  const handleReviewFilterChange = (filterType, value) => {
    setReviewFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // NEW: Function to get unique courses from reviews
  const getUniqueCoursesFromReviews = () => {
    const courses = studentReviews.map(review => review.courseTitle).filter(Boolean);
    return [...new Set(courses)];
  };

  // Payment Details functions
  const fetchPaymentHistory = async () => {
    try {
      // Try to fetch from API first
      try {
        const response = await axios.get('http://localhost:5000/api/admin/payments');
        if (response.data && response.data.length > 0) {
          console.log("💰 Payments from API:", response.data);
          setPaymentHistory(response.data);
          return;
        }
      } catch (apiError) {
        console.log("Payment API not available, checking localStorage");
      }

      // Fallback to localStorage from user dashboard
      const userPaymentHistory = localStorage.getItem('userPaymentHistory');
      if (userPaymentHistory) {
        const payments = JSON.parse(userPaymentHistory);
        console.log("💰 Payments from localStorage:", payments);
        setPaymentHistory(payments);
      } else {
        // Create sample payment data for demo
        const samplePayments = [
          {
            id: 'payment_1',
            userId: 'user_1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            courseId: '1',
            courseTitle: 'Clinical Research',
            amount: '₹89,999',
            paymentMethod: 'razorpay',
            date: new Date('2024-01-15').toISOString(),
            status: 'completed',
            transactionId: 'TXN_0012345678',
            receiptUrl: '#'
          },
          {
            id: 'payment_2',
            userId: 'user_2',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            courseId: '2',
            courseTitle: 'Bioinformatics',
            amount: '₹1,19,999',
            paymentMethod: 'razorpay',
            date: new Date('2024-01-14').toISOString(),
            status: 'completed',
            transactionId: 'TXN_0012345679',
            receiptUrl: '#'
          },
          {
            id: 'payment_3',
            userId: 'user_3',
            userName: 'Mike Johnson',
            userEmail: 'mike@example.com',
            courseId: '3',
            courseTitle: 'Medical Coding',
            amount: '₹74,999',
            paymentMethod: 'razorpay',
            date: new Date('2024-01-13').toISOString(),
            status: 'completed',
            transactionId: 'TXN_0012345680',
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

  const getFilteredPayments = () => {
    return paymentHistory.filter(payment => {
      const matchesStatus = paymentFilters.status === 'all' || payment.status === paymentFilters.status;
      const matchesMethod = paymentFilters.paymentMethod === 'all' || payment.paymentMethod === paymentFilters.paymentMethod;
      const matchesSearch = paymentFilters.search === '' || 
        payment.userName.toLowerCase().includes(paymentFilters.search.toLowerCase()) ||
        payment.courseTitle.toLowerCase().includes(paymentFilters.search.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(paymentFilters.search.toLowerCase());
      
      return matchesStatus && matchesMethod && matchesSearch;
    });
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const downloadReceipt = (payment) => {
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
          .status-completed {
            color: #27ae60;
            font-weight: bold;
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
              <span class="detail-value">${payment.transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(payment.date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Course:</span>
              <span class="detail-value">${payment.courseTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${payment.userName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Email:</span>
              <span class="detail-value">${payment.userEmail}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${payment.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value status-completed">${payment.status}</span>
            </div>
            
            <div class="amount-row">
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value" style="font-size: 24px; font-weight: bold; color: #27ae60;">
                  ${payment.amount}
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

  const handleFilterChange = (filterType, value) => {
    setPaymentFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const calculatePaymentStats = () => {
    const totalRevenue = paymentHistory.reduce((sum, payment) => {
      const amount = parseInt(payment.amount.replace(/[^0-9]/g, ''));
      return sum + amount;
    }, 0);

    const completedPayments = paymentHistory.filter(p => p.status === 'completed').length;
    const uniqueStudents = new Set(paymentHistory.map(p => p.userId)).size;
    const paymentMethods = new Set(paymentHistory.map(p => p.paymentMethod)).size;

    return {
      totalRevenue,
      completedPayments,
      uniqueStudents,
      paymentMethods
    };
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

        {/* Payment Statistics */}
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

        {/* Filters */}
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
            <label>Status</label>
            <select 
              className="admin-filter-select"
              value={paymentFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
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

        {/* Payments Table */}
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="admin-payment-row">
                    <td className="admin-payment-date">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="admin-payment-student">
                      <div>
                        <strong>{payment.userName}</strong>
                        <div style={{fontSize: '12px', color: '#666'}}>
                          {payment.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="admin-payment-course">
                      <strong>{payment.courseTitle}</strong>
                    </td>
                    <td className="admin-payment-amount">
                      <span className="admin-amount-badge">{payment.amount}</span>
                    </td>
                    <td className="admin-payment-method">
                      <span className={`admin-method-badge ${payment.paymentMethod}`}>
                        {payment.paymentMethod === 'razorpay' ? '💳 Razorpay' : payment.paymentMethod}
                      </span>
                    </td>
                    <td className="admin-payment-status">
                      <span className={`admin-status-badge ${payment.status}`}>
                        {payment.status === 'completed' ? '✅ Completed' : payment.status}
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
              onClick={() => setPaymentFilters({ status: 'all', paymentMethod: 'all', search: '' })}
              className="admin-btn primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
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
                  <span className="admin-detail-value">{selectedPayment.transactionId}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Date & Time:</span>
                  <span className="admin-detail-value">
                    {new Date(selectedPayment.date).toLocaleString()}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Status:</span>
                  <span className={`admin-detail-value admin-status-${selectedPayment.status}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Payment Method:</span>
                  <span className="admin-detail-value">{selectedPayment.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>Course Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Course:</span>
                  <span className="admin-detail-value">{selectedPayment.courseTitle}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Course ID:</span>
                  <span className="admin-detail-value">{selectedPayment.courseId}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>Student Information</h3>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student Name:</span>
                  <span className="admin-detail-value">{selectedPayment.userName}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student Email:</span>
                  <span className="admin-detail-value">{selectedPayment.userEmail}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Student ID:</span>
                  <span className="admin-detail-value">{selectedPayment.userId}</span>
                </div>
              </div>
            </div>

            <div className="admin-detail-section">
              <h3>Payment Amount</h3>
              <div className="admin-amount-display">
                <span className="admin-amount-label">Total Paid:</span>
                <span className="admin-amount-value">{selectedPayment.amount}</span>
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

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats");
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
        axios.get("http://localhost:5000/api/admin/videos"),
        axios.get("http://localhost:5000/api/admin/notes"),
        axios.get("http://localhost:5000/api/admin/quizzes"),
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
      const res = await axios.get("http://localhost:5000/api/admin/chart-data");
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
      const res = await axios.get("http://localhost:5000/api/admin/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/student-progress");
      setStudentProgress(res.data);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      setStudentProgress([]);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/feedbacks");
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
      
      setUserLogs(logs);
      setUniqueUsers(uniqueUsersData);
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const deleteUser = (email) => {
    if (window.confirm(`Are you sure you want to delete user: ${email}? This action cannot be undone.`)) {
      try {
        const updatedUniqueUsers = uniqueUsers.filter(user => user !== email);
        localStorage.setItem('uniqueUsers', JSON.stringify(updatedUniqueUsers));
        setUniqueUsers(updatedUniqueUsers);

        const updatedLogs = userLogs.filter(log => log.email !== email);
        localStorage.setItem('userLoginLogs', JSON.stringify(updatedLogs));
        setUserLogs(updatedLogs);

        fetchUserData();
        alert(`User ${email} has been deleted successfully.`);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      }
    }
  };

  const deleteAllUsers = () => {
    if (window.confirm("Are you sure you want to delete ALL users? This action cannot be undone and will remove all user data.")) {
      try {
        localStorage.removeItem('uniqueUsers');
        localStorage.removeItem('userLoginLogs');
        setUniqueUsers([]);
        setUserLogs([]);
        fetchUserData();
        alert("All users have been deleted successfully.");
      } catch (error) {
        console.error("Error deleting all users:", error);
        alert("Error deleting users. Please try again.");
      }
    }
  };

  // ---------------- Video Handlers ----------------
  const handleAddVideo = async (e) => {
    e.preventDefault();
    
    console.log("🔄 Starting video upload...");
    
    if (!videoTitle || !videoCourse) {
      alert("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", videoTitle);
    formData.append("course", videoCourse);
    formData.append("description", videoDescription || "No description provided");
    
    if (videoFile) {
      formData.append("file", videoFile);
      console.log("📁 File details:", {
        name: videoFile.name,
        type: videoFile.type,
        size: videoFile.size
      });
    } else if (!editingVideoId) {
      alert("Please select a video file");
      return;
    }

    try {
      console.log("📤 Sending request to backend...");
      
      let response;
      if (editingVideoId) {
        response = await axios.put(`http://localhost:5000/api/admin/videos/${editingVideoId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        });
        setEditingVideoId(null);
        alert("Video updated successfully!");
      } else {
        response = await axios.post("http://localhost:5000/api/admin/videos", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        });
        alert("Video saved successfully!");
      }

      console.log("✅ Upload successful:", response.data);

      // Reset form
      setVideoTitle("");
      setVideoCourse("");
      setVideoDescription("");
      setVideoFile(null);
      
      // Refresh data
      fetchAllData();
      fetchStats();
    } catch (error) {
      console.error("❌ Error adding/updating video:", error);
      
      let errorMessage = "Failed to save video. ";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += "Request timeout. The file might be too large.";
      } else if (error.response) {
        console.error("Server response error:", error.response.data);
        errorMessage += `Server error: ${error.response.data.error || error.response.data.message || error.response.statusText}`;
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage += "No response from server. Please check if the backend is running on port 5000.";
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/videos/${id}`);
        fetchAllData();
        alert("Video deleted successfully!");
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video. Please try again.");
      }
    }
  };

  const handleEditVideo = (video) => {
    setEditingVideoId(video._id);
    setVideoTitle(video.title || "");
    setVideoCourse(video.course || "");
    setVideoDescription(video.description || "");
  };

  const handleCancelEdit = () => {
    setEditingVideoId(null);
    setVideoTitle("");
    setVideoCourse("");
    setVideoDescription("");
    setVideoFile(null);
  };

  // ---------------- Note Handlers ----------------
  const handleAddNote = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", noteTitle);
    formData.append("course", noteCourse);
    if (noteFile) formData.append("file", noteFile);

    try {
      if (editingNoteId) {
        await axios.put(`http://localhost:5000/api/admin/notes/${editingNoteId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setEditingNoteId(null);
        alert("Edited successfully!");
      } else {
        await axios.post("http://localhost:5000/api/admin/notes", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert("Note saved successfully!");
      }

      setNoteTitle("");
      setNoteCourse("");
      setNoteFile(null);
      fetchAllData();
    } catch (error) {
      console.error("Error adding/updating note:", error);
      alert("Failed to save note. Please try again.");
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/notes/${id}`);
        fetchAllData();
        alert("Deleted successfully!");
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete note. Please try again.");
      }
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setNoteTitle(note.title);
    setNoteCourse(note.course);
  };

  // ---------------- Quiz Handlers ----------------
  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now(), 
      text: '', 
      options: [
        { id: Date.now() + 1, text: '', isCorrect: false },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ] 
    }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestionText = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { 
          ...q, 
          options: [...q.options, { id: Date.now(), text: '', isCorrect: false }] 
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId, optionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        return { 
          ...q, 
          options: q.options.filter(o => o.id !== optionId) 
        };
      }
      return q;
    }));
  };

  const updateOptionText = (questionId, optionId, text) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { 
          ...q, 
          options: q.options.map(o => 
            o.id === optionId ? { ...o, text } : o
          ) 
        };
      }
      return q;
    }));
  };

  const setCorrectOption = (questionId, optionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { 
          ...q, 
          options: q.options.map(o => ({ 
            ...o, 
            isCorrect: o.id === optionId 
          })) 
        };
      }
      return q;
    }));
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    
    const isValid = questions.every(q => 
      q.text.trim() !== '' && 
      q.options.every(o => o.text.trim() !== '') &&
      q.options.some(o => o.isCorrect)
    );
    
    if (!isValid) {
      alert("Please ensure all questions have text, all options have text, and each question has one correct option.");
      return;
    }
    
    try {
      const quizData = {
        title: quizTitle,
        course: quizCourse,
        questions: questions.map(q => ({
          questionText: q.text,
          options: q.options.map(o => ({
            optionText: o.text,
            isCorrect: o.isCorrect
          }))
        }))
      };

      if (editingQuizId) {
        await axios.put(`http://localhost:5000/api/admin/quizzes/${editingQuizId}`, quizData);
        setEditingQuizId(null);
        alert("Quiz updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/admin/quizzes", quizData);
        alert("Quiz created successfully!");
      }
      
      setQuizTitle("");
      setQuizCourse("");
      setQuestions([{ 
        id: Date.now(), 
        text: '', 
        options: [
          { id: Date.now() + 1, text: '', isCorrect: false },
          { id: Date.now() + 2, text: '', isCorrect: false }
        ] 
      }]);
      
      fetchAllData();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/quizzes/${id}`);
        fetchAllData();
        alert("Deleted successfully!");
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert("Failed to delete quiz. Please try again.");
      }
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setQuizTitle(quiz.title);
    setQuizCourse(quiz.course);
    
    if (quiz.questions && quiz.questions.length > 0) {
      setQuestions(quiz.questions.map((q, index) => ({
        id: Date.now() + index,
        text: q.questionText,
        options: q.options.map((o, optIndex) => ({
          id: Date.now() + index + optIndex,
          text: o.optionText,
          isCorrect: o.isCorrect
        }))
      })));
    } else {
      setQuestions([{ 
        id: Date.now(), 
        text: '', 
        options: [
          { id: Date.now() + 1, text: '', isCorrect: false },
          { id: Date.now() + 2, text: '', isCorrect: false }
        ] 
      }]);
    }
  };

  const handleViewQuiz = async (quiz) => {
    try {
      console.log("🔄 Attempting to fetch quiz with ID:", quiz._id);
      
      if (quiz.questions && quiz.questions.length > 0) {
        console.log("✅ Using local quiz data with questions");
        setViewingQuiz(quiz);
        return;
      }
      
      console.log("📡 Fetching quiz details from server...");
      const res = await axios.get(`http://localhost:5000/api/admin/quizzes/${quiz._id}`);
      
      if (res.data) {
        console.log("✅ Quiz data received from server:", res.data);
        setViewingQuiz(res.data);
      } else {
        console.warn("⚠️ No quiz data received from server");
        setViewingQuiz(quiz);
      }
    } catch (error) {
      console.error("❌ Error in handleViewQuiz:", error);
      setViewingQuiz(quiz);
      
      if (error.response) {
        console.error("Server responded with error:", error.response.status);
      } else if (error.request) {
        console.error("No response from server - is it running?");
        alert("Cannot connect to server. Make sure your backend is running on port 5000.");
      } else {
        console.error("Other error:", error.message);
      }
    }
  };

  const handleBackToQuizzes = () => {
    setViewingQuiz(null);
  };

  return (
    <div className="admin-dashboard">
      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-right">
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
            <li className={`admin-menu-item ${activeTab === 'students' && !viewingQuiz ? 'active' : ''}`}>
              <button onClick={() => { setActiveTab('students'); setViewingQuiz(null); }}>
                <span className="admin-menu-icon">👥</span>
                <span>Students</span>
              </button>
            </li>
            <li className={`admin-menu-item ${activeTab === 'progress' && !viewingQuiz ? 'active' : ''}`}>
              <button onClick={() => { setActiveTab('progress'); setViewingQuiz(null); }}>
                <span className="admin-menu-icon">📊</span>
                <span>Progress Tracking</span>
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
              <div className="admin-page-header">
                <div className="admin-page-header-left">
                  <button 
                    className="admin-btn secondary back-btn"
                    onClick={handleBackToQuizzes}
                  >
                    ← Back to Quizzes
                  </button>
                  <h1 className="admin-page-title">{viewingQuiz.title}</h1>
                </div>
                <div className="quiz-view-info">
                  <span className="quiz-course-badge">{viewingQuiz.course}</span>
                  <span className="quiz-questions-count">{viewingQuiz.questions?.length || 0} questions</span>
                </div>
              </div>

              <div className="quiz-view-content">
                {viewingQuiz.questions && viewingQuiz.questions.length > 0 ? (
                  <div className="quiz-questions-list">
                    {viewingQuiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="quiz-question-card">
                        <div className="question-header">
                          <h3>Question {qIndex + 1}</h3>
                        </div>
                        <div className="question-content">
                          <p className="question-text">{question.questionText}</p>
                          <div className="options-list">
                            {question.options.map((option, oIndex) => (
                              <div 
                                key={oIndex} 
                                className={`option-item ${option.isCorrect ? 'correct-option' : ''}`}
                              >
                                <span className="option-number">{String.fromCharCode(65 + oIndex)}</span>
                                <span className="option-text">{option.optionText}</span>
                                {option.isCorrect && (
                                  <span className="correct-indicator">✓ Correct Answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-message">
                    <h3>No Questions Available</h3>
                    <p>This quiz doesn't have any questions yet.</p>
                  </div>
                )}
              </div>

              <div className="quiz-view-actions">
                <button 
                  className="admin-btn primary"
                  onClick={() => handleEditQuiz(viewingQuiz)}
                >
                  Edit Quiz
                </button>
                <button 
                  className="admin-btn secondary"
                  onClick={handleBackToQuizzes}
                >
                  Back to List
                </button>
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
                        <p className="admin-stat-number">{stats.totalCertificates}</p>
                        <span className="admin-stat-change positive">+15% from last month</span>
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

                  {/* Content Stats Cards */}
                  <div className="admin-stats-grid">
                    <div className="admin-stat-card primary">
                      <div className="admin-stat-icon">🎬</div>
                      <div className="admin-stat-content">
                        <h3>Total Videos</h3>
                        <p className="admin-stat-number">{stats.totalVideos}</p>
                        <span className="admin-stat-change positive">Video content</span>
                      </div>
                    </div>
                    <div className="admin-stat-card success">
                      <div className="admin-stat-icon">📝</div>
                      <div className="admin-stat-content">
                        <h3>Total Notes</h3>
                        <p className="admin-stat-number">{stats.totalNotes}</p>
                        <span className="admin-stat-change positive">Study materials</span>
                      </div>
                    </div>
                    <div className="admin-stat-card warning">
                      <div className="admin-stat-icon">❓</div>
                      <div className="admin-stat-content">
                        <h3>Total Quizzes</h3>
                        <p className="admin-stat-number">{stats.totalQuizzes}</p>
                        <span className="admin-stat-change positive">Assessment tests</span>
                      </div>
                    </div>
                    <div className="admin-stat-card info">
                      <div className="admin-stat-icon">💬</div>
                      <div className="admin-stat-content">
                        <h3>Student Reviews</h3>
                        <p className="admin-stat-number">{reviewStats.totalReviews}</p>
                        <span className="admin-stat-change positive">⭐ {reviewStats.averageRating}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* NEW: Recent Reviews Section */}
                  {getRecentReviews().length > 0 && (
                    <div className="admin-recent-reviews">
                      <h3>Recent Reviews (Last 24 Hours)</h3>
                      <div className="admin-reviews-scroll">
                        {getRecentReviews().slice(0, 5).map(review => (
                          <div key={review._id} className="admin-review-preview">
                            <div className="review-preview-header">
                              <div className="review-preview-student">
                                <div className="admin-student-avatar small">
                                  {review.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <strong>{review.userName || 'Anonymous'}</strong>
                                  <span>{review.courseTitle || 'Unknown Course'}</span>
                                </div>
                              </div>
                              <div className="review-preview-rating">
                                {'★'.repeat(review.rating || 0)}
                              </div>
                            </div>
                            <p className="review-preview-text">
                              {review.reviewText?.substring(0, 100)}
                              {review.reviewText?.length > 100 ? '...' : ''}
                            </p>
                            <span className="review-preview-time">
                              {new Date(review.createdAt || review.date || review.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Charts Row */}
                  <div className="admin-charts-row">
                    <div className="admin-chart-card">
                      <h3>Student Distribution</h3>
                      <div className="admin-chart-container">
                        <Bar data={{
                          labels: chartData.courses,
                          datasets: [
                            {
                              label: 'Students per Course',
                              data: chartData.studentsPerCourse,
                              backgroundColor: 'rgba(79, 70, 229, 0.7)',
                              borderColor: 'rgba(79, 70, 229, 1)',
                              borderWidth: 1,
                            },
                          ],
                        }} options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Students Distribution',
                              font: {
                                size: 14
                              }
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
                        }} />
                      </div>
                    </div>
                    <div className="admin-chart-card">
                      <h3>Content Distribution</h3>
                      <div className="admin-chart-container">
                        <Bar data={{
                          labels: ['Videos', 'Notes', 'Quizzes'],
                          datasets: [
                            {
                              label: 'Content Count',
                              data: [stats.totalVideos, stats.totalNotes, stats.totalQuizzes],
                              backgroundColor: [
                                'rgba(79, 70, 229, 0.7)',
                                'rgba(34, 197, 94, 0.7)',
                                'rgba(245, 158, 11, 0.7)'
                              ],
                              borderColor: [
                                'rgba(79, 70, 229, 1)',
                                'rgba(34, 197, 94, 1)',
                                'rgba(245, 158, 11, 1)'
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }} options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Content Distribution',
                              font: {
                                size: 14
                              }
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
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity & Quick Actions */}
                  <div className="admin-content-row">
                    <div className="admin-recent-activity">
                      <h3>Recent User Activity</h3>
                      <div className="admin-activity-list">
                        {userLogs.slice(0, 5).map(log => (
                          <div key={log.id} className="admin-activity-item">
                            <div className="admin-activity-icon success">👥</div>
                            <div className="admin-activity-details">
                              <p><strong>{log.name || log.email.split('@')[0]}</strong> logged in</p>
                              <span className="admin-activity-time">{getTimeAgo(log.timestamp)}</span>
                            </div>
                          </div>
                        ))}
                        {userLogs.length === 0 && (
                          <div className="admin-activity-item">
                            <div className="admin-activity-icon">👥</div>
                            <div className="admin-activity-details">
                              <p>No recent user activity</p>
                              <span className="admin-activity-time">Users will appear here when they login</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-quick-actions">
                      <h3>Quick Actions</h3>
                      <div className="admin-actions-grid">
                        <button className="admin-action-card" onClick={() => setActiveTab('videos')}>
                          <div className="admin-action-icon">🎬</div>
                          <h4>Add Video</h4>
                          <p>Upload new course content</p>
                        </button>
                        <button className="admin-action-card" onClick={() => setActiveTab('students')}>
                          <div className="admin-action-icon">👥</div>
                          <h4>View Students</h4>
                          <p>Manage student accounts</p>
                        </button>
                        <button className="admin-action-card" onClick={() => setActiveTab('progress')}>
                          <div className="admin-action-icon">📊</div>
                          <h4>Track Progress</h4>
                          <p>Monitor student performance</p>
                        </button>
                        <button className="admin-action-card" onClick={() => setActiveTab('payment-details')}>
                          <div className="admin-action-icon">💳</div>
                          <h4>Payment Details</h4>
                          <p>View transactions & receipts</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Management */}
              {activeTab === 'students' && (
                <div className="admin-students">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Student Management</h1>
                    <div className="admin-page-actions">
                      <button className="admin-btn primary">Export Data</button>
                      <button 
                        className="admin-btn danger" 
                        onClick={deleteAllUsers}
                        disabled={uniqueUsers.length === 0}
                      >
                        Delete All Users
                      </button>
                    </div>
                  </div>

                  {/* Real User Stats */}
                  <div className="admin-stats-grid" style={{marginBottom: '2rem'}}>
                    <div className="admin-stat-card primary">
                      <div className="admin-stat-icon">👥</div>
                      <div className="admin-stat-content">
                        <h3>Total Registered Users</h3>
                        <p className="admin-stat-number">{userStats.uniqueUsers}</p>
                        <span className="admin-stat-change positive">Real-time data</span>
                      </div>
                    </div>
                    <div className="admin-stat-card success">
                      <div className="admin-stat-icon">📊</div>
                      <div className="admin-stat-content">
                        <h3>Total Logins</h3>
                        <p className="admin-stat-number">{userStats.totalLogins}</p>
                        <span className="admin-stat-change positive">All-time logins</span>
                      </div>
                    </div>
                    <div className="admin-stat-card warning">
                      <div className="admin-stat-icon">🕒</div>
                      <div className="admin-stat-content">
                        <h3>Today's Logins</h3>
                        <p className="admin-stat-number">{userStats.todayLogins}</p>
                        <span className="admin-stat-change positive">Active today</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-table-card">
                    {uniqueUsers.length > 0 ? (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Login Count</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueUsers.map((email) => {
                            const userLoginCount = userLogs.filter(log => log.email === email).length;
                            const lastLogin = userLogs.find(log => log.email === email);
                            
                            return (
                              <tr key={email}>
                                <td>
                                  <div className="admin-student-info">
                                    <div className="admin-student-avatar">
                                      {email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="admin-student-details">
                                      <span className="admin-student-name">{email.split('@')[0]}</span>
                                      <span className="admin-student-email">{email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>{email}</td>
                                <td>
                                  <span className="admin-status-badge active">{userLoginCount}</span>
                                </td>
                                <td>{lastLogin ? getTimeAgo(lastLogin.timestamp) : 'Never'}</td>
                                <td>
                                  <div className="admin-table-actions">
                                    <button 
                                      className="admin-btn action view"
                                      onClick={() => {
                                        const userLogs = getUserLoginLogs().filter(log => log.email === email);
                                        alert(`User: ${email}\nTotal Logins: ${userLogs.length}\nLast Login: ${userLogs[0]?.loginTime || 'Never'}`);
                                      }}
                                    >
                                      View
                                    </button>
                                    <button 
                                      className="admin-btn action delete"
                                      onClick={() => deleteUser(email)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="admin-empty-message">
                        <h3>No Users Found</h3>
                        <p>User data will appear here when users register and login to the platform.</p>
                        <p>Currently tracking: {userStats.uniqueUsers} registered users</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Login Activity */}
                  {userLogs.length > 0 && (
                    <div className="admin-table-card" style={{marginTop: '2rem'}}>
                      <h3 style={{padding: '1rem', margin: 0, borderBottom: '1px solid #e2e8f0'}}>Recent Login Activity</h3>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Login Time</th>
                            <th>Time Ago</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userLogs.slice(0, 10).map((log) => (
                            <tr key={log.id}>
                              <td>
                                <div className="admin-student-info">
                                  <div className="admin-student-avatar small">
                                    {log.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="admin-student-details">
                                    <span className="admin-student-name">{log.name || log.email.split('@')[0]}</span>
                                    <span className="admin-student-email">{log.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td>{log.loginTime}</td>
                              <td>{getTimeAgo(log.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tracking */}
              {activeTab === 'progress' && (
                <div className="admin-progress">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Student Progress Tracking</h1>
                    <div className="admin-page-actions">
                      <select className="admin-select">
                        <option>All Courses</option>
                        <option>Clinical Research</option>
                        <option>Bioinformatics</option>
                        <option>Medical Coding</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-progress-grid">
                    {studentProgress.map(progress => (
                      <div key={progress.studentId} className="admin-progress-card">
                        <div className="admin-progress-header">
                          <div className="admin-student-avatar">
                            {progress.name.charAt(0)}
                          </div>
                          <div className="admin-progress-student">
                            <h4>{progress.name}</h4>
                            <span>{progress.course}</span>
                          </div>
                          <div className="admin-progress-score">
                            <span className="admin-score">{progress.quizScore}%</span>
                            <span>Quiz Score</span>
                          </div>
                        </div>
                        <div className="admin-progress-bar">
                          <div 
                            className="admin-progress-fill" 
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                        <div className="admin-progress-details">
                          <span>Course Progress: {progress.progress}%</span>
                          <span>Last Active: {progress.lastActive}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Feedback & Reviews - COMPLETELY UPDATED */}
              {activeTab === 'feedbacks' && (
                <div className="admin-feedbacks">
                  <div className="admin-page-header">
                    <div className="admin-page-header-left">
                      <h1 className="admin-page-title">Student Feedback & Reviews</h1>
                      <div className="admin-header-actions">
                        <button 
                          className="admin-btn primary"
                          onClick={simulateUserReview}
                          title="Add test review"
                        >
                          + Test Review
                        </button>
                        <button 
                          className="admin-btn secondary"
                          onClick={handleRefreshReviews}
                          title="Refresh reviews"
                        >
                          🔄 Refresh
                        </button>
                        {studentReviews.length > 0 && (
                          <button 
                            className="admin-btn danger"
                            onClick={handleClearAllReviews}
                            title="Clear all reviews"
                          >
                            🗑️ Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="admin-feedback-stats">
                      <div className="admin-feedback-stat">
                        <span className="admin-feedback-rating">{reviewStats.averageRating}</span>
                        <span className="admin-feedback-label">Average Rating</span>
                      </div>
                      <div className="admin-feedback-stat">
                        <span className="admin-feedback-count">{reviewStats.totalReviews}</span>
                        <span className="admin-feedback-label">Total Reviews</span>
                      </div>
                      <div className="admin-feedback-stat">
                        <div className="rating-distribution">
                          {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="rating-bar">
                              <span>{rating}★</span>
                              <div className="bar-container">
                                <div 
                                  className="bar-fill" 
                                  style={{ 
                                    width: `${(reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100 || 0}%` 
                                  }}
                                ></div>
                              </div>
                              <span>({reviewStats.ratingDistribution[rating]})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time indicator */}
                  <div className="admin-realtime-indicator">
                    <span className="realtime-dot"></span>
                    <span>Auto-refresh active • Last checked: {new Date(lastUpdate).toLocaleTimeString()}</span>
                    <span className="review-source">Source: Real Student Reviews</span>
                  </div>

                  {/* Review Filters */}
                  <div className="admin-review-filters">
                    <div className="admin-search-box">
                      <span className="admin-search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search by student name, review text, or course..."
                        className="admin-search-input"
                        value={reviewFilters.search}
                        onChange={(e) => handleReviewFilterChange('search', e.target.value)}
                      />
                    </div>
                    
                    <div className="admin-filter-group">
                      <label>Course</label>
                      <select 
                        className="admin-filter-select"
                        value={reviewFilters.course}
                        onChange={(e) => handleReviewFilterChange('course', e.target.value)}
                      >
                        <option value="all">All Courses</option>
                        {getUniqueCoursesFromReviews().map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="admin-filter-group">
                      <label>Rating</label>
                      <select 
                        className="admin-filter-select"
                        value={reviewFilters.rating}
                        onChange={(e) => handleReviewFilterChange('rating', e.target.value)}
                      >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>
                    
                    <div className="admin-filter-group">
                      <label>Reply Status</label>
                      <select 
                        className="admin-filter-select"
                        value={reviewFilters.hasReply}
                        onChange={(e) => handleReviewFilterChange('hasReply', e.target.value)}
                      >
                        <option value="all">All Reviews</option>
                        <option value="replied">Replied</option>
                        <option value="not-replied">Not Replied</option>
                      </select>
                    </div>
                  </div>

                  {/* Reviews Grid */}
                  <div className="admin-feedbacks-grid">
                    {getFilteredReviews().length > 0 ? (
                      getFilteredReviews().map(review => (
                        <div key={review._id} className={`admin-feedback-card ${review.adminReply ? 'replied' : ''} ${review.isFeatured ? 'featured' : ''}`}>
                          {review.isFeatured && (
                            <div className="featured-badge">⭐ Featured</div>
                          )}
                          <div className="admin-feedback-header">
                            <div className="admin-feedback-student">
                              <div className="admin-student-avatar small">
                                {review.userName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4>{review.userName || 'Anonymous'}</h4>
                                <span className="student-email">{review.anonymous ? 'Anonymous' : review.userEmail || 'No email'}</span>
                                <span className="course-badge">{review.courseTitle || 'Unknown Course'}</span>
                              </div>
                            </div>
                            <div className="admin-feedback-rating">
                              <div className="star-rating">
                                {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                              </div>
                              <span className="rating-number">({review.rating || 0}/5)</span>
                            </div>
                          </div>
                          
                          <div className="admin-feedback-content">
                            <p>{review.reviewText || 'No review text provided.'}</p>
                          </div>
                          
                          <div className="admin-feedback-meta">
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {review.anonymous && (
                              <span className="anonymous-badge">Anonymous</span>
                            )}
                            {review.adminReply && (
                              <span className="replied-badge">Replied</span>
                            )}
                          </div>
                          
                          {review.adminReply && (
                            <div className="admin-reply-section">
                              <div className="admin-reply-header">
                                <strong>Admin Reply:</strong>
                                <span className="reply-date">
                                  {review.replyDate ? new Date(review.replyDate).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="admin-reply-text">{review.adminReply}</p>
                            </div>
                          )}
                          
                          <div className="admin-feedback-actions">
                            <button 
                              className="admin-btn action primary"
                              onClick={() => handleReplyToReview(review._id, review.userName || 'Student')}
                            >
                              {review.adminReply ? 'Edit Reply' : '💬 Reply'}
                            </button>
                            <button 
                              className={`admin-btn action ${review.isFeatured ? 'warning' : 'secondary'}`}
                              onClick={() => handleToggleFeatured(review._id)}
                            >
                              {review.isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
                            </button>
                            <button 
                              className="admin-btn action delete"
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="admin-empty-message">
                        <div className="admin-empty-icon">💬</div>
                        <h3>No Student Reviews Found</h3>
                        <p>Student reviews submitted from the user dashboard will appear here automatically.</p>
                        <p>The system checks for new reviews every 3 seconds.</p>
                        <div className="empty-actions">
                          <button 
                            className="admin-btn primary"
                            onClick={simulateUserReview}
                          >
                            + Add Test Review
                          </button>
                          <button 
                            className="admin-btn secondary"
                            onClick={handleRefreshReviews}
                          >
                            🔄 Check Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Debug Info (only in development) */}
                  {process.env.NODE_ENV === 'development' && studentReviews.length > 0 && (
                    <div className="admin-debug-info">
                      <details>
                        <summary>Debug Info ({studentReviews.length} reviews)</summary>
                        <div className="debug-stats">
                          <p><strong>Storage Locations:</strong></p>
                          <ul>
                            <li>Centralized Storage: {JSON.parse(localStorage.getItem('allStudentReviews') || '[]').length} reviews</li>
                            <li>User Storages: {uniqueUsers.length} users with potential reviews</li>
                          </ul>
                          <p><strong>Sample Review Data:</strong></p>
                          <pre>{JSON.stringify(studentReviews.slice(0, 2), null, 2)}</pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details Section */}
              {activeTab === 'payment-details' && renderPaymentDetails()}

              {/* Content Management - Videos */}
              {activeTab === 'videos' && (
                <div className="admin-content-management">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Manage Videos</h1>
                  </div>

                  <div className="admin-content-form">
                    <div className="admin-form-card">
                      <h2>{editingVideoId ? "Edit Video" : "Add New Video"}</h2>
                      
                      <form onSubmit={handleAddVideo}>
                        <div className="admin-form-group">
                          <label>Course *</label>
                          <select
                            value={videoCourse}
                            onChange={(e) => setVideoCourse(e.target.value)}
                            required
                            className="admin-select"
                          >
                            <option value="">Select a course</option>
                            {defaultCourses.map(course => (
                              <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="admin-form-group">
                          <label>Title *</label>
                          <input
                            type="text"
                            placeholder="Video title"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="admin-form-group">
                          <label>Description</label>
                          <textarea
                            placeholder="Video description"
                            value={videoDescription}
                            onChange={(e) => setVideoDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div className="admin-form-group">
                          <label>Video File {!editingVideoId && '*'}</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                console.log("Selected file:", file.name, file.type, file.size);
                                setVideoFile(file);
                              }
                            }}
                          />
                          <small>Supported formats: MP4, AVI, MOV, WMV</small>
                          {videoFile && (
                            <div className="file-info">
                              <strong>Selected:</strong> {videoFile.name} 
                              ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </div>
                          )}
                        </div>
                        
                        <div className="admin-form-actions">
                          <button 
                            type="submit" 
                            className="admin-submit-btn primary"
                            disabled={!videoTitle || !videoCourse || (!editingVideoId && !videoFile)}
                          >
                            {editingVideoId ? "Update Video" : "Add Video"}
                          </button>
                          {editingVideoId && (
                            <button 
                              type="button" 
                              className="admin-btn secondary"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                    
                    <div className="admin-content-list">
                      <h2>Video Library ({videos.length})</h2>
                      
                      <div className="admin-list-card">
                        {videos.length === 0 ? (
                          <div className="admin-empty-message">
                            <h3>No Videos Found</h3>
                            <p>Upload your first video to get started.</p>
                          </div>
                        ) : (
                          <ul className="admin-list">
                            {videos.map((video) => (
                              <li key={video._id} className="admin-list-item">
                                <div className="admin-item-info">
                                  <span className="admin-item-course">
                                    {defaultCourses.find(c => c._id === video.course)?.title || video.course}
                                  </span>
                                  <span className="admin-item-title">{video.title}</span>
                                  {video.description && (
                                    <span className="admin-item-description">{video.description}</span>
                                  )}
                                </div>
                                <div className="admin-item-actions">
                                  {video.url && (
                                    <a 
                                      href={`http://localhost:5000${video.url}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="admin-btn action view"
                                    >
                                      View
                                    </a>
                                  )}
                                  <button 
                                    onClick={() => handleEditVideo(video)}
                                    className="admin-btn action edit"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteVideo(video._id)}
                                    className="admin-btn action delete"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Management - Notes */}
              {activeTab === 'notes' && (
                <div className="admin-content-management">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Manage Notes</h1>
                  </div>

                  <div className="admin-content-form">
                    <div className="admin-form-card">
                      <h2>{editingNoteId ? "Edit Note" : "Add New Note"}</h2>
                      
                      <form onSubmit={handleAddNote}>
                        <div className="admin-form-group">
                          <label>Course *</label>
                          <select
                            value={noteCourse}
                            onChange={(e) => setNoteCourse(e.target.value)}
                            required
                            className="admin-select"
                          >
                            <option value="">Select a course</option>
                            {defaultCourses.map(course => (
                              <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="admin-form-group">
                          <label>Title *</label>
                          <input
                            type="text"
                            placeholder="Note title"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="admin-form-group">
                          <label>Note File *</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => setNoteFile(e.target.files[0])}
                            required
                          />
                          <small>Supported formats: PDF, DOC, DOCX, TXT</small>
                          {noteFile && (
                            <div className="file-info">
                              <strong>Selected:</strong> {noteFile.name} 
                              ({(noteFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </div>
                          )}
                        </div>
                        
                        <div className="admin-form-actions">
                          <button 
                            type="submit" 
                            className="admin-submit-btn primary"
                            disabled={!noteTitle || !noteCourse || !noteFile}
                          >
                            {editingNoteId ? "Update Note" : "Add Note"}
                          </button>
                          {editingNoteId && (
                            <button 
                              type="button" 
                              className="admin-btn secondary"
                              onClick={() => setEditingNoteId(null)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                    
                    <div className="admin-content-list">
                      <h2>Notes Library ({notes.length})</h2>
                      
                      <div className="admin-list-card">
                        {notes.length === 0 ? (
                          <div className="admin-empty-message">
                            <h3>No Notes Found</h3>
                            <p>Upload your first note to get started.</p>
                          </div>
                        ) : (
                          <ul className="admin-list">
                            {notes.map((note) => (
                              <li key={note._id} className="admin-list-item">
                                <div className="admin-item-info">
                                  <span className="admin-item-course">
                                    {defaultCourses.find(c => c._id === note.course)?.title || note.course}
                                  </span>
                                  <span className="admin-item-title">{note.title}</span>
                                  <span className="admin-item-meta">
                                    {note.fileType?.toUpperCase() || 'PDF'} • {note.pages || 'N/A'} pages
                                  </span>
                                </div>
                                <div className="admin-item-actions">
                                  <a 
                                    href={`http://localhost:5000${note.url}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="admin-btn action view"
                                  >
                                    View
                                  </a>
                                  <button 
                                    onClick={() => handleEditNote(note)}
                                    className="admin-btn action edit"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteNote(note._id)}
                                    className="admin-btn action delete"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Management - Quizzes */}
              {activeTab === 'quizzes' && (
                <div className="admin-content-management">
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Manage Quizzes</h1>
                  </div>

                  <div className="admin-content-form">
                    <div className="admin-form-card enhanced-quiz-form">
                      <div className="form-header">
                        <h2>{editingQuizId ? "Edit Quiz" : "Create New Quiz"}</h2>
                        <div className="form-icon">❓</div>
                      </div>
                      
                      <form onSubmit={handleAddQuiz}>
                        <div className="admin-form-group">
                          <label>Course *</label>
                          <select
                            value={quizCourse}
                            onChange={(e) => setQuizCourse(e.target.value)}
                            required
                            className="admin-select"
                          >
                            <option value="">Select a course</option>
                            {defaultCourses.map(course => (
                              <option key={course._id} value={course._id}>{course.title}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="admin-form-group">
                          <label>Quiz Title *</label>
                          <input
                            type="text"
                            placeholder="Quiz title"
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="admin-questions-section">
                          <div className="admin-section-header">
                            <h3>Quiz Questions</h3>
                            <button 
                              type="button" 
                              className="admin-btn secondary"
                              onClick={addQuestion}
                            >
                              + Add Question
                            </button>
                          </div>
                          
                          {questions.map((question, qIndex) => (
                            <div key={question.id} className="admin-question-card enhanced">
                              <div className="admin-question-header">
                                <h4>Question {qIndex + 1}</h4>
                                {questions.length > 1 && (
                                  <button 
                                    type="button" 
                                    className="admin-btn action delete"
                                    onClick={() => removeQuestion(question.id)}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              
                              <div className="admin-form-group">
                                <label>Question Text *</label>
                                <textarea
                                  placeholder="Enter your question"
                                  value={question.text}
                                  onChange={(e) => updateQuestionText(question.id, e.target.value)}
                                  required
                                  rows={3}
                                />
                              </div>
                              
                              <div className="admin-options-section">
                                <div className="admin-section-header">
                                  <h5>Options</h5>
                                  <button 
                                    type="button" 
                                    className="admin-btn secondary small"
                                    onClick={() => addOption(question.id)}
                                  >
                                    + Add Option
                                  </button>
                                </div>
                                
                                {question.options.map((option, oIndex) => (
                                  <div key={option.id} className="admin-option-item enhanced">
                                    <div className="admin-option-input">
                                      <input
                                        type="text"
                                        placeholder={`Option ${oIndex + 1}`}
                                        value={option.text}
                                        onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                                        required
                                      />
                                    </div>
                                    
                                    <div className="admin-option-correct">
                                      <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={option.isCorrect}
                                        onChange={() => setCorrectOption(question.id, option.id)}
                                      />
                                      <label>Correct</label>
                                    </div>
                                    
                                    {question.options.length > 2 && (
                                      <button 
                                        type="button"
                                        className="admin-btn action delete small"
                                        onClick={() => removeOption(question.id, option.id)}
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button type="submit" className="admin-submit-btn primary">
                          {editingQuizId ? "Update Quiz" : "Create Quiz"}
                        </button>
                      </form>
                    </div>
                    
                    <div className="admin-content-list">
                      <h2>Quizzes Library ({quizzes.length})</h2>
                      
                      <div className="admin-list-card">
                        {quizzes.length === 0 ? (
                          <div className="admin-empty-message">
                            <h3>No Quizzes Found</h3>
                            <p>Create your first quiz to get started.</p>
                          </div>
                        ) : (
                          <ul className="admin-list">
                            {quizzes.map((quiz) => (
                              <li key={quiz._id} className="admin-list-item">
                                <div className="admin-item-info">
                                  <span className="admin-item-course">
                                    {defaultCourses.find(c => c._id === quiz.course)?.title || quiz.course}
                                  </span>
                                  <span className="admin-item-title">{quiz.title}</span>
                                  <span className="admin-item-meta">
                                    {quiz.questions?.length || 0} questions
                                  </span>
                                </div>
                                <div className="admin-item-actions">
                                  <button 
                                    onClick={() => handleViewQuiz(quiz)}
                                    className="admin-btn action view"
                                  >
                                    View
                                  </button>
                                  <button 
                                    onClick={() => handleEditQuiz(quiz)}
                                    className="admin-btn action edit"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuiz(quiz._id)}
                                    className="admin-btn action delete"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Payment Modal */}
      {renderPaymentModal()}
    </div>
  );
}

export default AdminDashboard;