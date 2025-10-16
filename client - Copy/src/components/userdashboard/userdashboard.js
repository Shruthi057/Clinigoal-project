import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './userdashboard.css';

export default function UserDashboard() {
  const [userData, setUserData] = useState({
    userName: 'User Name',
    userEmail: 'user@example.com',
    userId: ''
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseContent, setCourseContent] = useState({
    videos: [],
    notes: [],
    quizzes: []
  });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [completedNotes, setCompletedNotes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  
  // New states for profile photo
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // New states for quiz timer and enhanced scoring
  const [quizTimer, setQuizTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  
  // Student review form state - UPDATED
  const [reviewForm, setReviewForm] = useState({
    courseId: '',
    rating: 5,
    reviewText: '',
    anonymous: false
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Enrollment form state
  const [enrollmentForm, setEnrollmentForm] = useState({
    courseId: '',
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    paymentMethod: 'razorpay',
    agreeToTerms: false
  });
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentCourse, setEnrollmentCourse] = useState(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [paidCourses, setPaidCourses] = useState(new Set());

  // Certificate generation state
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  // Settings state
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Payment Details state
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Default courses from PRD with proper images
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

  // Image compression helper function
  const compressImage = (src, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        // Resize the canvas
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the compressed data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = (error) => reject(error);
    });
  };

  // Fetch all user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userName = localStorage.getItem('userName') || 'Student';
        const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
        const userId = localStorage.getItem('userId') || '';

        setUserData({ userName, userEmail, userId });

        // Load profile photo from sessionStorage first, then localStorage
        const savedProfilePhoto = sessionStorage.getItem('userProfilePhoto') || 
                                localStorage.getItem('userProfilePhoto');
        if (savedProfilePhoto) {
          setProfilePhoto(savedProfilePhoto);
        }

        // Load completed items from localStorage
        const savedWatchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        setWatchedVideos(savedWatchedVideos);
        
        const savedCompletedNotes = JSON.parse(localStorage.getItem('completedNotes') || '[]');
        setCompletedNotes(savedCompletedNotes);
        
        const savedCompletedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        setCompletedQuizzes(savedCompletedQuizzes);

        // Load paid courses from localStorage
        const savedPaidCourses = localStorage.getItem('paidCourses');
        if (savedPaidCourses) {
          setPaidCourses(new Set(JSON.parse(savedPaidCourses)));
        }

        // Load certificates from localStorage
        const savedCertificates = JSON.parse(localStorage.getItem('userCertificates') || '[]');
        setCertificates(savedCertificates);

        // Load user settings from localStorage
        const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        setUserSettings({
          notifications: savedSettings.notifications !== undefined ? savedSettings.notifications : true,
          emailUpdates: savedSettings.emailUpdates !== undefined ? savedSettings.emailUpdates : true,
          darkMode: savedSettings.darkMode !== undefined ? savedSettings.darkMode : false
        });

        // Load payment history from localStorage
        const savedPaymentHistory = JSON.parse(localStorage.getItem('userPaymentHistory') || '[]');
        setPaymentHistory(savedPaymentHistory);

        // Start with no enrolled courses so all courses show enrollment option
        setEnrolledCourses([]);
        localStorage.setItem('userEnrollments', JSON.stringify([]));

        // Set available courses from PRD
        setAvailableCourses(defaultCourses);

        // Fetch student reviews from API
        try {
          const reviewsResponse = await fetch('https://clinigoal-server.onrender.com/api/reviews');
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
          }
        } catch (error) {
          console.log('Reviews API not available, using demo reviews');
          // If no reviews exist, create some demo reviews
          const demoReviews = [
            {
              _id: '1',
              courseId: '1',
              courseTitle: "Clinical Research",
              userName: "Anonymous",
              rating: 5,
              reviewText: "Excellent course! The instructor was very knowledgeable and the content was comprehensive.",
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              courseId: '2',
              courseTitle: "Bioinformatics",
              userName: "Student123",
              rating: 4,
              reviewText: "Great introduction to bioinformatics. The practical examples were very helpful.",
              createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            }
          ];
          setReviews(demoReviews);
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (userSettings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [userSettings.darkMode]);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Profile photo functions with compression and error handling
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB. Please choose a smaller image.');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      setIsUploading(true);
      
      try {
        // Read the file as data URL
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const originalDataUrl = event.target.result;
            
            // Compress the image
            const compressedDataUrl = await compressImage(originalDataUrl, 200, 200, 0.7);
            
            // Check compressed size
            const compressedSize = Math.round(compressedDataUrl.length * 3/4); // Approximate size in bytes
            if (compressedSize > 500 * 1024) { // 500KB limit
              alert('Compressed image is still too large. Please choose a smaller image.');
              setIsUploading(false);
              return;
            }
            
            setProfilePhoto(compressedDataUrl);
            
            // Try to save to sessionStorage first
            try {
              sessionStorage.setItem('userProfilePhoto', compressedDataUrl);
            } catch (sessionStorageError) {
              console.error('Session storage error:', sessionStorageError);
              // Fallback to localStorage
              try {
                localStorage.setItem('userProfilePhoto', compressedDataUrl);
              } catch (localStorageError) {
                console.error('Local storage error:', localStorageError);
                alert('Unable to save profile photo to browser storage. The photo will only be available during this session.');
              }
            }
          } catch (error) {
            console.error('Image processing error:', error);
            alert('Error processing image. Please try a different image.');
          } finally {
            setIsUploading(false);
          }
        };
        
        reader.onerror = () => {
          setIsUploading(false);
          alert('Error reading file. Please try again.');
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        setIsUploading(false);
        console.error('Upload error:', error);
        alert('Error uploading image. Please try again.');
      }
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    try {
      sessionStorage.removeItem('userProfilePhoto');
      localStorage.removeItem('userProfilePhoto');
    } catch (error) {
      console.error('Error removing photo from storage:', error);
    }
  };

  // Settings handler functions
  const handleSettingsChange = (setting, value) => {
    const updatedSettings = { ...userSettings, [setting]: value };
    setUserSettings(updatedSettings);
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
  };

  // Password change handler functions
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordChangeStatus({
        type: 'error',
        message: 'New passwords do not match'
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordChangeStatus({
        type: 'error',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }
    
    // Simulate password change
    setTimeout(() => {
      setPasswordChangeStatus({
        type: 'success',
        message: 'Password changed successfully'
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setPasswordChangeStatus(null);
      }, 3000);
    }, 1000);
  };

  // Export data function
  const handleExportData = () => {
    // Collect user data
    const userDataForExport = {
      profile: {
        userName: userData.userName,
        userEmail: userData.userEmail,
        profilePhoto: profilePhoto
      },
      settings: userSettings,
      enrolledCourses: Array.from(paidCourses),
      certificates: certificates,
      watchedVideos: watchedVideos,
      completedNotes: completedNotes,
      completedQuizzes: completedQuizzes,
      paymentHistory: paymentHistory,
      exportDate: new Date().toISOString()
    };
    
    // Convert to JSON and download
    const dataStr = JSON.stringify(userDataForExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `clinigoal_data_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Account deletion functions
  const handleDeleteAccount = () => {
    if (deleteConfirmationText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }
    
    // Simulate account deletion
    alert('Account deletion simulated. In a real application, this would delete your account and all associated data.');
    
    // Reset state
    setShowDeleteConfirm(false);
    setDeleteConfirmationText('');
    
    // In a real app, you would redirect to login or home page
    // window.location.href = '/login';
  };

  // Payment History Functions
  const addPaymentToHistory = (course, amount, paymentMethod = 'razorpay') => {
    const newPayment = {
      id: `payment_${Date.now()}`,
      courseId: course._id,
      courseTitle: course.title,
      amount: amount,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
      status: 'completed',
      transactionId: `TXN_${Date.now().toString(36).toUpperCase()}`,
      receiptUrl: `#receipt-${Date.now()}`
    };
    
    const updatedPaymentHistory = [newPayment, ...paymentHistory];
    setPaymentHistory(updatedPaymentHistory);
    localStorage.setItem('userPaymentHistory', JSON.stringify(updatedPaymentHistory));
    
    return newPayment;
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const downloadReceipt = (payment) => {
    // Create a printable receipt
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
            
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${userData.userName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student Email:</span>
              <span class="detail-value">${userData.userEmail}</span>
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
    
    // Give time for the content to load before printing
    setTimeout(() => {
      receiptWindow.print();
    }, 500);
  };

  // Fetch course content when a course is selected
  const fetchCourseContent = async (courseId) => {
    console.log("🔄 Fetching course content for courseId:", courseId);
    
    try {
      // Try the new course-specific endpoints first
      const [videosRes, notesRes, quizzesRes] = await Promise.all([
        fetch(`https://clinigoal-server.onrender.com/api/videos/course/${courseId}`),
        fetch(`https://clinigoal-server.onrender.com/api/notes/course/${courseId}`),
        fetch(`https://clinigoal-server.onrender.com/api/quizzes/course/${courseId}`)
      ]);

      console.log("📡 API Response status:", {
        videos: videosRes.status,
        notes: notesRes.status,
        quizzes: quizzesRes.status
      });

      let videos = [];
      let notes = [];
      let quizzes = [];

      if (videosRes.ok) {
        videos = await videosRes.json();
        console.log("🎬 Videos from course endpoint:", videos);
      } else {
        console.log("⚠️ Course-specific videos endpoint failed, falling back to all videos");
        // Fallback to all videos and filter
        const allVideosRes = await fetch('https://clinigoal-server.onrender.com/api/admin/videos');
        if (allVideosRes.ok) {
          const allVideos = await allVideosRes.json();
          videos = allVideos.filter(video => video.course === courseId);
          console.log("🎬 Filtered videos:", videos);
        }
      }

      if (notesRes.ok) {
        notes = await notesRes.json();
      } else {
        const allNotesRes = await fetch('https://clinigoal-server.onrender.com/api/admin/notes');
        if (allNotesRes.ok) {
          const allNotes = await allNotesRes.json();
          notes = allNotes.filter(note => note.course === courseId);
        }
      }

      if (quizzesRes.ok) {
        quizzes = await quizzesRes.json();
      } else {
        const allQuizzesRes = await fetch('https://clinigoal-server.onrender.com/api/admin/quizzes');
        if (allQuizzesRes.ok) {
          const allQuizzes = await allQuizzesRes.json();
          quizzes = allQuizzes.filter(quiz => quiz.course === courseId);
        }
      }

      console.log("📊 Final content for course", courseId, ":", {
        videosCount: videos.length,
        notesCount: notes.length,
        quizzesCount: quizzes.length
      });

      setCourseContent({
        videos,
        notes,
        quizzes
      });
    } catch (error) {
      console.error('❌ Error fetching course content:', error);
      
      // Set demo content for paid courses
      if (paidCourses.has(courseId)) {
        console.log("📋 Setting demo content for course:", courseId);
        setCourseContent({
          videos: [
            {
              _id: '1',
              title: 'Introduction to Course',
              description: 'Get started with the course overview and learning objectives',
              duration: 1200,
              thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              module: 'Module 1'
            },
            {
              _id: '2',
              title: 'Advanced Concepts',
              description: 'Deep dive into advanced topics and practical applications',
              duration: 1800,
              thumbnail: 'https://images.unsplash.com/photo-1581091226835-a8a0058f0a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              module: 'Module 2'
            }
          ],
          notes: [
            {
              _id: '1',
              title: 'Course Study Guide',
              description: 'Comprehensive study material for the entire course',
              fileType: 'pdf',
              pages: 45,
              url: '/api/notes/1.pdf'
            },
            {
              _id: '2',
              title: 'Practice Exercises',
              description: 'Hands-on exercises to reinforce learning',
              fileType: 'pdf',
              pages: 23,
              url: '/api/notes/2.pdf'
            }
          ],
          quizzes: [
            {
              _id: '1',
              title: 'Module 1 Assessment',
              description: 'Test your knowledge from the first module',
              timeLimit: 30,
              passingScore: 70,
              questions: [
                {
                  _id: 'q1',
                  questionText: "What is the primary goal of clinical research?",
                  options: [
                    { id: 'q1_opt1', optionText: "To develop new drugs", isCorrect: false },
                    { id: 'q1_opt2', optionText: "To determine the safety and effectiveness of medical interventions", isCorrect: true },
                    { id: 'q1_opt3', optionText: "To train medical professionals", isCorrect: false },
                    { id: 'q1_opt4', optionText: "To market pharmaceutical products", isCorrect: false }
                  ]
                },
                {
                  _id: 'q2',
                  questionText: "What does GCP stand for?",
                  options: [
                    { id: 'q2_opt1', optionText: "General Clinical Practices", isCorrect: false },
                    { id: 'q2_opt2', optionText: "Good Clinical Practices", isCorrect: true },
                    { id: 'q2_opt3', optionText: "Guided Clinical Procedures", isCorrect: false },
                    { id: 'q2_opt4', optionText: "Global Clinical Protocols", isCorrect: false }
                  ]
                }
              ]
            }
          ]
        });
      } else {
        console.log("🚫 No demo content - course not paid:", courseId);
        setCourseContent({
          videos: [],
          notes: [],
          quizzes: []
        });
      }
    }
  };

  // Calculate course completion percentage
  const calculateCourseCompletion = (courseId) => {
    const courseVideos = courseContent.videos.length;
    const courseNotes = courseContent.notes.length;
    const courseQuizzes = courseContent.quizzes.length;
    
    const totalItems = courseVideos + courseNotes + courseQuizzes;
    if (totalItems === 0) return 0;
    
    const watchedVideosCount = watchedVideos.filter(videoId => 
      courseContent.videos.some(video => video._id === videoId)
    ).length;
    
    const completedNotesCount = completedNotes.filter(noteId => 
      courseContent.notes.some(note => note._id === noteId)
    ).length;
    
    const completedQuizzesCount = completedQuizzes.filter(quizId => 
      courseContent.quizzes.some(quiz => quiz._id === quizId)
    ).length;
    
    const completedItems = watchedVideosCount + completedNotesCount + completedQuizzesCount;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  // Check if course is fully completed
  const isCourseCompleted = (courseId) => {
    return calculateCourseCompletion(courseId) === 100;
  };

  // Calculate progress statistics from real data
  const calculateStats = () => {
    const totalCourses = enrolledCourses.length + paidCourses.size;
    const completedCourses = enrolledCourses.filter(course => course.progress === 100).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / totalCourses)
      : 0;
    
    // Calculate total learning time from course data
    const totalLearningTime = enrolledCourses.reduce((acc, course) => {
      return acc + (course.timeSpent || 0);
    }, 0);
    
    const hours = Math.floor(totalLearningTime / 60);
    const minutes = totalLearningTime % 60;
    const learningTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    return { totalCourses, completedCourses, averageProgress, learningTime };
  };

  const { totalCourses, completedCourses, averageProgress, learningTime } = calculateStats();

  const ProgressBar = ({ progress }) => (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="progress-text">{progress}%</span>
    </div>
  );

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Generate Certificate Function
  const generateCertificate = async (course) => {
    if (!isCourseCompleted(course._id)) {
      alert('Please complete all course content (videos, notes, and quizzes) to generate your certificate.');
      return;
    }

    setIsGeneratingCertificate(true);
    
    try {
      // Simulate certificate generation process
      const certificate = {
        _id: `cert_${Date.now()}`,
        courseId: course._id,
        courseTitle: course.title,
        studentName: userData.userName,
        issueDate: new Date().toISOString(),
        certificateId: `CLG-${course._id}-${Date.now().toString().slice(-6)}`,
        instructor: course.instructor,
        duration: course.duration
      };

      // Add to certificates list
      setCertificates(prev => [...prev, certificate]);
      
      // Show certificate modal
      setCertificateData(certificate);
      setShowCertificateModal(true);
      
      // Save to localStorage
      const savedCertificates = JSON.parse(localStorage.getItem('userCertificates') || '[]');
      localStorage.setItem('userCertificates', JSON.stringify([...savedCertificates, certificate]));
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Download Certificate as PDF
  const downloadCertificateAsPDF = (certificate) => {
    const certificateWindow = window.open('', '_blank');
    certificateWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${certificate.courseTitle}</title>
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .certificate-container {
            background: white;
            padding: 60px 40px;
            border: 20px solid #f4d03f;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 800px;
            position: relative;
          }
          .certificate-header {
            margin-bottom: 40px;
          }
          .certificate-title {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .certificate-subtitle {
            font-size: 24px;
            color: #7f8c8d;
            margin-bottom: 40px;
          }
          .certificate-body {
            margin: 40px 0;
          }
          .certificate-text {
            font-size: 20px;
            line-height: 1.6;
            margin: 20px 0;
          }
          .student-name {
            font-size: 36px;
            font-weight: bold;
            color: #e74c3c;
            margin: 30px 0;
            border-bottom: 2px solid #bdc3c7;
            padding-bottom: 10px;
          }
          .course-title {
            font-size: 28px;
            color: #2c3e50;
            margin: 20px 0;
          }
          .certificate-footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .signature-section {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #2c3e50;
            width: 200px;
            margin: 10px 0;
          }
          .certificate-id {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 12px;
            color: #7f8c8d;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="certificate-header">
            <div class="logo">CLINIGOAL</div>
            <div class="certificate-title">CERTIFICATE OF COMPLETION</div>
            <div class="certificate-subtitle">This certifies that</div>
          </div>
          
          <div class="certificate-body">
            <div class="student-name">${certificate.studentName}</div>
            <div class="certificate-text">has successfully completed the course</div>
            <div class="course-title">${certificate.courseTitle}</div>
            <div class="certificate-text">
              with a duration of ${certificate.duration}<br/>
              under the instruction of ${certificate.instructor}
            </div>
          </div>
          
          <div class="certificate-footer">
            <div class="signature-section">
              <div class="signature-line"></div>
              <div>Date</div>
              <div>${new Date(certificate.issueDate).toLocaleDateString()}</div>
            </div>
            <div class="signature-section">
              <div class="signature-line"></div>
              <div>Clinigoal Director</div>
            </div>
          </div>
          
          <div class="certificate-id">
            Certificate ID: ${certificate.certificateId}
          </div>
        </div>
      </body>
      </html>
    `);
    
    certificateWindow.document.close();
    
    // Give time for the content to load before printing
    setTimeout(() => {
      certificateWindow.print();
    }, 500);
  };

  // Mark note as completed
  const handleCompleteNote = (noteId) => {
    if (!completedNotes.includes(noteId)) {
      setCompletedNotes(prev => [...prev, noteId]);
      
      // Update local storage
      const savedCompletedNotes = JSON.parse(localStorage.getItem('completedNotes') || '[]');
      localStorage.setItem('completedNotes', JSON.stringify([...savedCompletedNotes, noteId]));
    }
  };

  // Quiz Functions - FIXED VERSION
  const startQuiz = async (quiz) => {
    try {
      console.log("🚀 Starting quiz:", quiz.title);
      
      // If the quiz doesn't have questions, fetch them from the server
      if (!quiz.questions || quiz.questions.length === 0) {
        try {
          const response = await fetch(`https://clinigoal-server.onrender.com/api/admin/quizzes/${quiz._id}`);
          if (response.ok) {
            const fullQuiz = await response.json();
            setActiveQuiz(fullQuiz);
            setQuizAnswers({});
            setQuizResults(null);
            
            // Initialize timer and question tracking
            setQuizTimer(0);
            setQuestionStartTime({});
            setQuestionTimes({});
            
            // Start the timer
            const interval = setInterval(() => {
              setQuizTimer(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);
            
            return;
          }
        } catch (error) {
          console.error("Error fetching full quiz:", error);
        }
      }
      
      // Ensure questions have proper IDs
      const quizWithProperIds = {
        ...quiz,
        questions: quiz.questions?.map((question, qIndex) => ({
          ...question,
          _id: question._id || `q${qIndex}`,
          options: question.options?.map((option, oIndex) => ({
            ...option,
            id: option.id || `q${qIndex}_opt${oIndex}`
          }))
        })) || []
      };
      
      console.log("🎯 Quiz with proper IDs:", quizWithProperIds);
      
      // Use the quiz with proper IDs
      setActiveQuiz(quizWithProperIds);
      setQuizAnswers({});
      setQuizResults(null);
      
      // Initialize timer and question tracking
      setQuizTimer(0);
      setQuestionStartTime({});
      setQuestionTimes({});
      
      // Start the timer
      const interval = setInterval(() => {
        setQuizTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    console.log("📝 Answer selected:", { questionId, optionId });
    
    // Record time spent on this question
    if (questionStartTime[questionId]) {
      const timeSpent = Math.floor(Date.now() / 1000) - questionStartTime[questionId];
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: timeSpent
      }));
    }
    
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    // Set start time for the next question
    setQuestionStartTime(prev => ({
      ...prev,
      [questionId]: Math.floor(Date.now() / 1000)
    }));
    
    console.log("📝 Updated quiz answers:", { ...quizAnswers, [questionId]: optionId });
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    // Stop the timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    console.log("📤 Submitting quiz...");
    console.log("Quiz answers:", quizAnswers);
    console.log("Active quiz questions:", activeQuiz.questions);

    try {
      // Calculate results locally first
      let correctAnswers = 0;
      let totalQuestions = activeQuiz.questions.length;

      // Prepare detailed results for each question
      const detailedResults = activeQuiz.questions.map((question, questionIndex) => {
        const questionId = question._id || `q${questionIndex}`;
        const selectedOptionId = quizAnswers[questionId];
        
        console.log(`Question ${questionIndex + 1}:`, {
          questionId,
          selectedOptionId,
          questionText: question.questionText,
          options: question.options
        });

        // Find the selected option
        const selectedOption = question.options.find(opt => 
          opt.id === selectedOptionId || opt._id === selectedOptionId
        );
        
        // Find the correct option
        const correctOption = question.options.find(opt => opt.isCorrect === true);
        
        // Check if the selected option is correct
        const isCorrect = selectedOption && selectedOption.isCorrect === true;
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        console.log(`Question ${questionIndex + 1} result:`, {
          selectedOption: selectedOption?.optionText || 'Not answered',
          correctOption: correctOption?.optionText || 'No correct answer specified',
          isCorrect
        });
        
        return {
          questionId,
          questionText: question.questionText,
          selectedOption: selectedOption ? selectedOption.optionText : 'Not answered',
          correctOption: correctOption ? correctOption.optionText : 'No correct answer specified',
          isCorrect,
          timeSpent: questionTimes[questionId] || 0
        };
      });

      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= (activeQuiz.passingScore || 70);

      // Format the time
      const formattedTime = formatTime(quizTimer);

      const results = {
        score,
        passed,
        totalQuestions,
        correctAnswers,
        timeSpent: formattedTime,
        timeInSeconds: quizTimer,
        detailedResults
      };

      console.log("📊 Quiz results:", results);

      // Mark quiz as completed if passed
      if (passed && activeQuiz._id && !completedQuizzes.includes(activeQuiz._id)) {
        setCompletedQuizzes(prev => [...prev, activeQuiz._id]);
        
        // Update local storage
        const savedCompletedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        localStorage.setItem('completedQuizzes', JSON.stringify([...savedCompletedQuizzes, activeQuiz._id]));
      }

      // Try to submit to server if available
      try {
        const response = await fetch(`/api/quizzes/${activeQuiz._id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            answers: quizAnswers,
            timeSpent: quizTimer,
            questionTimes: questionTimes
          })
        });

        if (response.ok) {
          const serverResults = await response.json();
          console.log("✅ Quiz submitted to server successfully");
          // Use server results if available, otherwise use local results
          setQuizResults(serverResults);
        } else {
          console.log("⚠️ Server submission failed, using local results");
          setQuizResults(results);
        }
      } catch (error) {
        console.log("⚠️ Could not submit to server, using local results:", error);
        setQuizResults(results);
      }

      // Update local course progress if quiz passed
      if (results.passed && selectedCourse) {
        const updatedCourses = enrolledCourses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, progress: Math.min(100, course.progress + 10) }
            : course
        );
        setEnrolledCourses(updatedCourses);
        
        // Update localStorage
        localStorage.setItem('userEnrollments', JSON.stringify(updatedCourses));
      }

    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const resetQuiz = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setQuizTimer(0);
    setActiveQuiz(null);
    setQuizAnswers({});
    setQuizResults(null);
    setQuestionStartTime({});
    setQuestionTimes({});
  };

  // Content View Functions
  const openCourseContent = (course) => {
    setSelectedCourse(course);
    setActiveSection('course-content');
    fetchCourseContent(course.courseId || course.id || course._id);
  };

  // Enrollment Form Functions
  const handleEnrollmentClick = (course) => {
    setEnrollmentCourse(course);
    setEnrollmentForm({
      courseId: course._id,
      studentName: userData.userName,
      studentEmail: userData.userEmail,
      studentPhone: '',
      paymentMethod: 'razorpay',
      agreeToTerms: false
    });
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEnrollmentForm({
      ...enrollmentForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Razorpay Payment Function - Updated to mark course as paid and store payment details
  const handleRazorpayPayment = async () => {
    if (enrollmentCourse) {
      // Mark course as paid
      const updatedPaidCourses = new Set([...paidCourses, enrollmentCourse._id]);
      setPaidCourses(updatedPaidCourses);
      
      // Save to localStorage
      localStorage.setItem('paidCourses', JSON.stringify([...updatedPaidCourses]));
      
      // Add payment to history
      const payment = addPaymentToHistory(enrollmentCourse, enrollmentCourse.price);
      
      // Show success message
      setEnrollmentSuccess(true);
      
      // Close form after 3 seconds
      setTimeout(() => {
        setShowEnrollmentForm(false);
        setEnrollmentSuccess(false);
      }, 3000);
    }
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!enrollmentForm.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    // Trigger Razorpay payment
    await handleRazorpayPayment();
  };

  const handleWatchVideo = async (video) => {
    try {
      // Add video to watched videos list
      if (!watchedVideos.includes(video._id)) {
        setWatchedVideos(prev => [...prev, video._id]);
        
        // Update local storage
        const savedWatchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        localStorage.setItem('watchedVideos', JSON.stringify([...savedWatchedVideos, video._id]));
      }
      
      // Mark video as watched and update progress
      await fetch(`/api/courses/${selectedCourse.id}/videos/${video._id}/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.log('Watch API not available, updating locally');
      });

      // Update local progress
      if (selectedCourse) {
        const updatedCourses = enrolledCourses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, progress: Math.min(100, course.progress + 5) }
            : course
        );
        setEnrolledCourses(updatedCourses);
        
        // Update localStorage
        localStorage.setItem('userEnrollments', JSON.stringify(updatedCourses));
      }
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  // NEW: Enhanced Student Review Functions for Admin Dashboard Integration
  const handleReviewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRatingClick = (rating) => {
    setReviewForm({...reviewForm, rating});
  };

  const handleRatingHover = (rating) => {
    setHoverRating(rating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  // UPDATED: Enhanced Review Submission Function
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get current user info
      const currentUser = {
        name: userData.userName,
        email: userData.userEmail
      };
      
      // Create a comprehensive review object
      const newReview = {
        _id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        courseId: reviewForm.courseId,
        courseTitle: availableCourses.find(c => c._id === reviewForm.courseId)?.title || '',
        userName: reviewForm.anonymous ? 'Anonymous' : currentUser.name,
        userEmail: reviewForm.anonymous ? '' : currentUser.email,
        rating: parseInt(reviewForm.rating),
        reviewText: reviewForm.reviewText,
        anonymous: reviewForm.anonymous,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      console.log("📝 Submitting review:", newReview);

      // Method 1: Save to user's personal review storage
      const userKey = `userReviews_${currentUser.email.replace(/[@.]/g, '_')}`;
      const userExistingReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
      userExistingReviews.push(newReview);
      localStorage.setItem(userKey, JSON.stringify(userExistingReviews));
      
      console.log(`💾 Saved to user storage: ${userKey}`, userExistingReviews.length);

      // Method 2: Update centralized storage for admin dashboard
      const centralizedReviews = JSON.parse(localStorage.getItem('allStudentReviews') || '[]');
      centralizedReviews.unshift(newReview); // Add to beginning
      localStorage.setItem('allStudentReviews', JSON.stringify(centralizedReviews));
      
      console.log("💾 Saved to centralized storage:", centralizedReviews.length);

      // Method 3: Try to submit to API
      try {
        const response = await fetch('https://clinigoal-server.onrender.com/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newReview)
        });

        if (response.ok) {
          const savedReview = await response.json();
          console.log("✅ Review submitted to API successfully");
          setReviews(prev => [savedReview, ...prev]);
        } else {
          console.log("⚠️ API submission failed, using local storage");
          setReviews(prev => [newReview, ...prev]);
        }
      } catch (error) {
        console.log("⚠️ API not available, using local storage");
        setReviews(prev => [newReview, ...prev]);
      }
      
      // Show success message
      setReviewSubmitted(true);
      
      // Reset form
      setReviewForm({
        courseId: '',
        rating: 5,
        reviewText: '',
        anonymous: false
      });
      
      // Reset submission status after 3 seconds
      setTimeout(() => setReviewSubmitted(false), 3000);
      
      console.log("🎉 Review submitted successfully!");
      
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // NEW: Function to load user's own reviews
  const loadUserReviews = () => {
    try {
      const userKey = `userReviews_${userData.userEmail.replace(/[@.]/g, '_')}`;
      const userReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
      console.log(`👤 Loaded ${userReviews.length} reviews for user`);
      return userReviews;
    } catch (error) {
      console.error('Error loading user reviews:', error);
      return [];
    }
  };

  // Check if course is paid
  const isCoursePaid = (courseId) => {
    return paidCourses.has(courseId);
  };

  // Payment Details Section
  const renderPaymentDetails = () => (
    <div className="payment-details-content">
      <div className="section-header">
        <h2>Payment History & Receipts</h2>
        <p>View your payment history and download receipts</p>
      </div>

      <div className="payment-stats">
        <div className="payment-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{paymentHistory.length}</h3>
            <p>Total Payments</p>
          </div>
        </div>
        <div className="payment-stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{paidCourses.size}</h3>
            <p>Paid Courses</p>
          </div>
        </div>
        <div className="payment-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{paymentHistory.filter(p => p.status === 'completed').length}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="payment-stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>{new Set(paymentHistory.map(p => p.paymentMethod)).size}</h3>
            <p>Payment Methods</p>
          </div>
        </div>
      </div>

      {paymentHistory.length > 0 ? (
        <div className="payment-history-section">
          <h3>Recent Payments</h3>
          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map(payment => (
                  <tr key={payment.id} className="payment-row">
                    <td className="payment-date">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="payment-course">
                      <div className="course-info-small">
                        <strong>{payment.courseTitle}</strong>
                      </div>
                    </td>
                    <td className="payment-amount">
                      <span className="amount-badge">{payment.amount}</span>
                    </td>
                    <td className="payment-method">
                      <span className={`method-badge ${payment.paymentMethod}`}>
                        {payment.paymentMethod === 'razorpay' ? '💳 Razorpay' : payment.paymentMethod}
                      </span>
                    </td>
                    <td className="payment-status">
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status === 'completed' ? '✅ Completed' : payment.status}
                      </span>
                    </td>
                    <td className="payment-actions">
                      <button 
                        onClick={() => viewPaymentDetails(payment)}
                        className="btn-secondary btn-sm"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => downloadReceipt(payment)}
                        className="btn-primary btn-sm"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h3>No Payment History</h3>
          <p>You haven't made any payments yet. Enroll in a course to see your payment history here.</p>
          <button 
            onClick={() => setActiveSection('available-courses')}
            className="btn-primary"
          >
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );

  // Payment Details Modal
  const renderPaymentModal = () => {
    if (!showPaymentModal || !selectedPayment) return null;

    return (
      <div className="payment-modal-overlay">
        <div className="payment-modal">
          <div className="modal-header">
            <h2>Payment Details</h2>
            <button 
              className="close-btn" 
              onClick={() => setShowPaymentModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="payment-details">
            <div className="detail-section">
              <h3>Transaction Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{selectedPayment.transactionId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date & Time:</span>
                  <span className="detail-value">
                    {new Date(selectedPayment.date).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-${selectedPayment.status}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{selectedPayment.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Course Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Course:</span>
                  <span className="detail-value">{selectedPayment.courseTitle}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Course ID:</span>
                  <span className="detail-value">{selectedPayment.courseId}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Payment Amount</h3>
              <div className="amount-display">
                <span className="amount-label">Total Paid:</span>
                <span className="amount-value">{selectedPayment.amount}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Student Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{userData.userName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{userData.userEmail}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              onClick={() => downloadReceipt(selectedPayment)}
              className="btn-primary"
            >
              📥 Download Receipt
            </button>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Section
  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <div className="welcome-header">
          {profilePhoto ? (
            <img 
              src={profilePhoto} 
              alt="Profile" 
              className="welcome-profile-photo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="welcome-avatar" style={{ display: profilePhoto ? 'none' : 'flex' }}>
            {userData.userName ? userData.userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1>Welcome back, {userData.userName}! 👋</h1>
            <p>Continue your clinical education journey with Clinigoal</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{totalCourses}</h3>
            <p>Enrolled Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>{averageProgress}%</h3>
            <p>Average Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>{completedCourses}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{paymentHistory.length}</h3>
            <p>Payments</p>
          </div>
        </div>
      </div>

      {(enrolledCourses.length > 0 || paidCourses.size > 0) ? (
        <div className="courses-section">
          <div className="section-header">
            <h2>Continue Learning</h2>
            <button className="view-all" onClick={() => setActiveSection('my-courses')}>
              View All
            </button>
          </div>
          <div className="courses-grid">
            {availableCourses.filter(course => 
              enrolledCourses.some(ec => ec.courseId === course._id) || isCoursePaid(course._id)
            ).slice(0, 3).map(course => (
              <div key={course._id} className="course-card enrolled">
                <div className="course-image">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="course-image-fallback">
                    {course.title.charAt(0)}
                  </div>
                  <div className="course-badge">Paid</div>
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="instructor">By {course.instructor}</p>
                  <div className="progress-section">
                    <ProgressBar progress={0} />
                    <p className="last-accessed">
                      Start learning today
                    </p>
                  </div>
                  <div className="course-actions">
                    <button 
                      onClick={() => openCourseContent(course)}
                      className="btn-primary"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-courses-section">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Courses Enrolled Yet</h3>
            <p>Start your clinical education journey by enrolling in our specialized courses</p>
            <button 
              onClick={() => setActiveSection('available-courses')}
              className="btn-primary"
            >
              Browse Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyCourses = () => (
    <div className="my-courses-content">
      <div className="section-header">
        <h2>My Courses</h2>
        <p>Track your progress and continue your clinical education</p>
      </div>
      
      {(enrolledCourses.length > 0 || paidCourses.size > 0) ? (
        <div className="courses-list">
          {availableCourses.filter(course => 
            enrolledCourses.some(ec => ec.courseId === course._id) || isCoursePaid(course._id)
          ).map(course => (
            <div key={course._id} className="course-item">
              <div className="course-thumbnail">
                <img 
                  src={course.image} 
                  alt={course.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="course-thumbnail-fallback">
                  {course.title.charAt(0)}
                </div>
              </div>
              <div className="course-details">
                <h3>{course.title}</h3>
                <p className="instructor">By {course.instructor}</p>
                <p className="duration">Status: Paid</p>
                <div className="progress-info">
                  <ProgressBar progress={0} />
                  <span className="progress-label">0% completed</span>
                </div>
              </div>
              <div className="course-actions">
                <button 
                  onClick={() => openCourseContent(course)}
                  className="btn-primary"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Courses Enrolled</h3>
          <p>You haven't enrolled in any courses yet. Explore our clinical education programs to get started.</p>
          <button 
            onClick={() => setActiveSection('available-courses')}
            className="btn-primary"
          >
            Browse All Courses
          </button>
        </div>
      )}
    </div>
  );

  // Available Courses Section
  const renderAvailableCourses = () => (
    <div className="available-courses-content">
      <div className="section-header">
        <h2>Clinigoal Courses</h2>
        <p>Specialized programs for clinical education and career advancement</p>
      </div>
      
      {availableCourses.length > 0 ? (
        <div className="clinigoal-courses-grid">
          {availableCourses.map(course => {
            // Check if the user is enrolled or has paid for this course
            const isEnrolled = enrolledCourses.some(ec => ec.courseId === course._id);
            const hasPaid = isCoursePaid(course._id);
            const canAccess = isEnrolled || hasPaid;
            
            return (
              <div key={course._id} className="clinigoal-course-card">
                <div className="course-image">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="course-image-fallback">
                    {course.title.charAt(0)}
                  </div>
                  <div className="course-level">{course.level}</div>
                  {hasPaid && (
                    <div className="paid-badge">Paid</div>
                  )}
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="instructor">By {course.instructor}</p>
                  <p className="course-description">{course.description}</p>
                  
                  {course.features && course.features.length > 0 && (
                    <div className="course-features">
                      {course.features.map((feature, index) => (
                        <span key={index} className="feature-tag">✓ {feature}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="course-meta">
                    <span className="duration">⏱️ {course.duration}</span>
                    <span className="price">💰 {course.price}</span>
                  </div>
                  
                  <div className="course-actions">
                    {canAccess ? (
                      <button 
                        onClick={() => openCourseContent(course)}
                        className="btn-primary"
                      >
                        View Details
                      </button>
                    ) : (
                      <>
                        <button className="btn-secondary">
                          Course Details
                        </button>
                        <button 
                          onClick={() => handleEnrollmentClick(course)}
                          className="btn-primary"
                        >
                          Enroll Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Courses Available</h3>
          <p>There are currently no courses available for enrollment.</p>
        </div>
      )}
      
      {/* Enrollment Form Modal */}
      {showEnrollmentForm && enrollmentCourse && (
        <div className="enrollment-modal-overlay">
          <div className="enrollment-modal">
            <div className="modal-header">
              <h2>Enroll in {enrollmentCourse.title}</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowEnrollmentForm(false)}
              >
                ×
              </button>
            </div>
            
            {enrollmentSuccess ? (
              <div className="enrollment-success">
                <div className="success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>You have successfully paid for {enrollmentCourse.title}.</p>
                <p>You can now access all course materials.</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollmentSubmit} className="enrollment-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={enrollmentForm.studentName}
                    onChange={handleEnrollmentChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="studentEmail"
                    value={enrollmentForm.studentEmail}
                    onChange={handleEnrollmentChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="studentPhone"
                    value={enrollmentForm.studentPhone}
                    onChange={handleEnrollmentChange}
                    placeholder="Enter your phone number"
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-methods">
                    <div className="payment-option">
                      <input
                        type="radio"
                        id="razorpay"
                        name="paymentMethod"
                        value="razorpay"
                        checked={enrollmentForm.paymentMethod === 'razorpay'}
                        onChange={handleEnrollmentChange}
                      />
                      <label htmlFor="razorpay">
                        <span className="payment-icon">💳</span>
                        Razorpay
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="form-group terms-group">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={enrollmentForm.agreeToTerms}
                    onChange={handleEnrollmentChange}
                    required
                    className="form-checkbox"
                  />
                  <label htmlFor="agreeToTerms">
                    I agree to the <a href="#" className="terms-link">Terms and Conditions</a> and <a href="#" className="terms-link">Refund Policy</a>
                  </label>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowEnrollmentForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary razorpay-btn"
                    disabled={!enrollmentForm.agreeToTerms}
                  >
                    <span className="razorpay-text">Pay with Razorpay</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Certificates Section
  const renderCertificates = () => (
    <div className="certificates-content">
      <div className="section-header">
        <h2>My Certificates</h2>
        <p>Your clinical education achievements and completed courses</p>
      </div>
      
      {certificates.length > 0 ? (
        <div className="certificates-grid">
          {certificates.map(certificate => (
            <div key={certificate._id} className="certificate-card">
              <div className="certificate-header">
                <div className="certificate-icon">🏆</div>
                <div className="certificate-info">
                  <h3>{certificate.courseTitle}</h3>
                  <p>Completed on {new Date(certificate.issueDate).toLocaleDateString()}</p>
                  <span className="certificate-id">
                    {certificate.certificateId}
                  </span>
                </div>
              </div>
              <div className="certificate-actions">
                <button 
                  onClick={() => downloadCertificateAsPDF(certificate)}
                  className="btn-primary"
                >
                  Download PDF
                </button>
                <button className="btn-secondary">
                  Share Achievement
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No Certificates Yet</h3>
          <p>Complete your enrolled courses to earn Clinigoal certificates</p>
          <button 
            onClick={() => setActiveSection('my-courses')}
            className="btn-primary"
          >
            Continue Learning
          </button>
        </div>
      )}
    </div>
  );

  // Progress Tracking Section
  const renderProgressTracking = () => (
    <div className="progress-tracking-content">
      <div className="section-header">
        <h2>Learning Progress</h2>
        <p>Track your clinical education journey</p>
      </div>

      <div className="progress-overview">
        <div className="overview-card">
          <h3>Overall Progress</h3>
          <div className="overall-progress">
            <ProgressBar progress={averageProgress} />
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="number">{totalCourses}</span>
              <span className="label">Total Courses</span>
            </div>
            <div className="stat">
              <span className="number">{completedCourses}</span>
              <span className="label">Completed</span>
            </div>
            <div className="stat">
              <span className="number">{totalCourses - completedCourses}</span>
              <span className="label">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {(enrolledCourses.length > 0 || paidCourses.size > 0) && (
        <div className="detailed-progress">
          <h3>Course-wise Progress</h3>
          {availableCourses.filter(course => 
            enrolledCourses.some(ec => ec.courseId === course._id) || isCoursePaid(course._id)
          ).map(course => (
            <div key={course._id} className="course-progress-item">
              <div className="course-info">
                <h4>{course.title}</h4>
                <p>Status: Paid</p>
              </div>
              <div className="progress-display">
                <ProgressBar progress={0} />
                <span className="status">
                  Not Started
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // UPDATED: Student Review Section with Enhanced Storage
  const renderStudentReview = () => {
    // Load user's own reviews
    const userReviews = loadUserReviews();
    const displayReviews = userReviews.length > 0 ? userReviews : reviews;

    return (
      <div className="student-review-content">
        <div className="section-header">
          <h2>Student Reviews</h2>
          <p>Share your feedback about our courses and help us improve</p>
        </div>

        <div className="review-container">
          <div className="review-form-container">
            <div className="form-header">
              <h3>Submit Your Review</h3>
              <p>Your feedback helps us improve our courses</p>
            </div>
            
            {reviewSubmitted ? (
              <div className="review-success">
                <div className="success-icon">✓</div>
                <h3>Review Submitted Successfully!</h3>
                <p>Thank you for your feedback. Your review has been submitted and will be visible in the admin dashboard.</p>
                <p className="review-note">💡 Your review is now stored and will appear in the admin panel.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label>Select Course *</label>
                  <div className="select-wrapper">
                    <select 
                      name="courseId" 
                      value={reviewForm.courseId} 
                      onChange={handleReviewChange}
                      required
                      className="custom-select"
                    >
                      <option value="">Select a course you've enrolled in</option>
                      {availableCourses.filter(course => isCoursePaid(course._id)).map(course => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {availableCourses.filter(course => isCoursePaid(course._id)).length === 0 && (
                    <p className="form-hint">You need to enroll in a course first to submit a review.</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Rating *</label>
                  <div className="rating-container">
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star ${star <= (hoverRating || reviewForm.rating) ? 'filled' : ''}`}
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => handleRatingHover(star)}
                          onMouseLeave={handleRatingLeave}
                          aria-label={`Rate ${star} stars`}
                        >
                          <span className="star-icon">★</span>
                        </button>
                      ))}
                    </div>
                    <div className="rating-value">
                      {reviewForm.rating} out of 5
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Review *</label>
                  <div className="textarea-wrapper">
                    <textarea
                      name="reviewText"
                      value={reviewForm.reviewText}
                      onChange={handleReviewChange}
                      placeholder="Share your experience with this course. What did you like? What could be improved?"
                      rows={5}
                      required
                      maxLength={500}
                      className="custom-textarea"
                    ></textarea>
                    <div className="char-count">
                      {reviewForm.reviewText.length}/500 characters
                    </div>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="anonymous"
                      checked={reviewForm.anonymous}
                      onChange={handleReviewChange}
                      className="custom-checkbox"
                    />
                    <span className="checkmark"></span>
                    <span>Submit review anonymously</span>
                  </label>
                  <p className="checkbox-hint">Your name will be hidden from other students</p>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary submit-btn"
                  disabled={!reviewForm.courseId || !reviewForm.reviewText}
                >
                  Submit Review
                </button>

                <div className="form-footer">
                  <p className="form-note">
                    💡 Your review will be stored securely and made available to course administrators 
                    to help improve the learning experience for all students.
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="reviews-list-container">
            <div className="reviews-header">
              <h3>Your Reviews</h3>
              <div className="review-count">{displayReviews.length} reviews</div>
            </div>
            
            {displayReviews.length > 0 ? (
              <div className="reviews-list">
                {displayReviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {(review.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4>{review.userName || 'Anonymous'}</h4>
                          <p>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="stars">
                          {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                        </div>
                        <span className="rating-number">{review.rating || 0}/5</span>
                      </div>
                    </div>
                    <div className="review-course">
                      <span className="course-tag">{review.courseTitle || 'Unknown Course'}</span>
                      {review.anonymous && (
                        <span className="anonymous-tag">Anonymous</span>
                      )}
                    </div>
                    <div className="review-text">
                      <p>{review.reviewText || 'No review text available.'}</p>
                    </div>
                    {review.adminReply && (
                      <div className="admin-reply">
                        <div className="admin-reply-header">
                          <strong>Admin Response:</strong>
                        </div>
                        <p className="admin-reply-text">{review.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-reviews">
                <div className="empty-icon">💬</div>
                <h3>No Reviews Yet</h3>
                <p>Be the first to share your experience with our courses!</p>
                <p>Your reviews help other students and improve our course quality.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Settings Section - ENHANCED
  const renderSettings = () => (
    <div className="settings-content">
      <div className="section-header">
        <h2>Settings</h2>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
        {/* Profile Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">👤</div>
            <h3>Profile Settings</h3>
          </div>
          
          <div className="settings-card-content">
            <div className="profile-settings">
              <div className="profile-photo-section">
                <div className="current-photo">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Profile" 
                      className="current-profile-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="profile-photo-placeholder">
                      {userData.userName ? userData.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="photo-actions">
                  <label htmlFor="settings-profile-upload" className="btn-primary">
                    {isUploading ? 'Uploading...' : 'Upload New Photo'}
                  </label>
                  <input
                    id="settings-profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  {profilePhoto && (
                    <button 
                      onClick={handleRemovePhoto}
                      className="btn-secondary"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              
              <div className="profile-info">
                <div className="info-item">
                  <label>Name</label>
                  <div className="info-value">{userData.userName}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">{userData.userEmail}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔔</div>
            <h3>Notification Settings</h3>
          </div>
          
          <div className="settings-card-content">
            <div className="settings-options">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive email updates about your courses and account</p>
                </div>
                <div className="setting-toggle">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={userSettings.emailUpdates}
                      onChange={(e) => handleSettingsChange('emailUpdates', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications for important updates</p>
                </div>
                <div className="setting-toggle">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={userSettings.notifications}
                      onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🎨</div>
            <h3>Appearance</h3>
          </div>
          
          <div className="settings-card-content">
            <div className="settings-options">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Dark Mode</h4>
                  <p>Switch to dark theme for better viewing in low light</p>
                </div>
                <div className="setting-toggle">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={userSettings.darkMode}
                      onChange={(e) => handleSettingsChange('darkMode', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔒</div>
            <h3>Security</h3>
          </div>
          
          <div className="settings-card-content">
            <div className="password-change-section">
              <h4>Change Password</h4>
              
              {passwordChangeStatus && (
                <div className={`password-status ${passwordChangeStatus.type}`}>
                  {passwordChangeStatus.message}
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>
                
                <button type="submit" className="btn-primary">
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">⚙️</div>
            <h3>Account Management</h3>
          </div>
          
          <div className="settings-card-content">
            <div className="account-actions">
              <button className="btn-secondary" onClick={handleExportData}>
                📥 Export My Data
              </button>
              
              <button 
                className="btn-danger" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ Delete Account
              </button>
            </div>
            
            {showDeleteConfirm && (
              <div className="delete-confirmation">
                <div className="delete-warning">
                  <h4>⚠️ Delete Account</h4>
                  <p>This action cannot be undone. This will permanently delete your account and all your data.</p>
                  
                  <div className="delete-form">
                    <p>Type "DELETE" to confirm:</p>
                    <input
                      type="text"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      className="form-input"
                      placeholder="Type DELETE here"
                    />
                    
                    <div className="delete-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmationText('');
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourseContent = () => {
    const completionPercentage = calculateCourseCompletion(selectedCourse?._id);
    const isCompleted = isCourseCompleted(selectedCourse?._id);

    return (
      <div className="course-content-page">
        <div className="content-header">
          <button 
            className="back-btn"
            onClick={() => setActiveSection('my-courses')}
          >
            ← Back to My Courses
          </button>
          <div className="course-info">
            <h1>{selectedCourse?.courseTitle || selectedCourse?.title}</h1>
            <div className="completion-status">
              <span className={`status-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
                {isCompleted ? '🎉 Completed' : `📚 ${completionPercentage}% Complete`}
              </span>
            </div>
          </div>
          <div className="progress-section">
            <ProgressBar progress={completionPercentage} />
            <span className="progress-label">{completionPercentage}% Complete</span>
          </div>
        </div>

        {/* Certificate Section - Only show if course is completed */}
        {isCompleted && (
          <div className="certificate-section">
            <div className="certificate-card premium">
              <div className="certificate-icon">🏆</div>
              <div className="certificate-info">
                <h3>Course Completed!</h3>
                <p>Congratulations! You've successfully completed all requirements for this course.</p>
                <p>Generate your certificate to showcase your achievement.</p>
              </div>
              <button 
                onClick={() => generateCertificate(selectedCourse)}
                disabled={isGeneratingCertificate}
                className="btn-primary certificate-btn"
              >
                {isGeneratingCertificate ? (
                  <>
                    <div className="spinner-small"></div>
                    Generating...
                  </>
                ) : (
                  '🎓 Generate Certificate'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Debug Section - Remove this in production */}
        <div className="debug-section" style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
          <h4>Debug Info</h4>
          <p>Selected Course: {selectedCourse?.title || 'None'}</p>
          <p>Course ID: {selectedCourse?.courseId || selectedCourse?.id || selectedCourse?._id || 'None'}</p>
          <p>Videos Count: {courseContent.videos.length}</p>
          <p>Notes Count: {courseContent.notes.length}</p>
          <p>Quizzes Count: {courseContent.quizzes.length}</p>
          <p>Watched Videos: {watchedVideos.length}</p>
          <p>Completed Notes: {completedNotes.length}</p>
          <p>Completed Quizzes: {completedQuizzes.length}</p>
          <p>Completion: {completionPercentage}%</p>
          <p>Is Completed: {isCompleted ? 'Yes' : 'No'}</p>
          
          {/* Quick completion buttons for testing */}
          <div style={{marginTop: '10px'}}>
            <button 
              onClick={() => {
                // Mark all videos as watched
                const allVideoIds = courseContent.videos.map(v => v._id);
                setWatchedVideos(allVideoIds);
                localStorage.setItem('watchedVideos', JSON.stringify(allVideoIds));
                
                // Mark all notes as completed
                const allNoteIds = courseContent.notes.map(n => n._id);
                setCompletedNotes(allNoteIds);
                localStorage.setItem('completedNotes', JSON.stringify(allNoteIds));
                
                // Mark all quizzes as completed
                const allQuizIds = courseContent.quizzes.map(q => q._id);
                setCompletedQuizzes(allQuizIds);
                localStorage.setItem('completedQuizzes', JSON.stringify(allQuizIds));
                
                alert('All content marked as completed for testing!');
              }}
              className="btn-secondary"
              style={{marginRight: '10px'}}
            >
              Mark All Complete (Test)
            </button>
            
            <button 
              onClick={() => {
                setWatchedVideos([]);
                setCompletedNotes([]);
                setCompletedQuizzes([]);
                localStorage.setItem('watchedVideos', JSON.stringify([]));
                localStorage.setItem('completedNotes', JSON.stringify([]));
                localStorage.setItem('completedQuizzes', JSON.stringify([]));
                alert('Progress reset!');
              }}
              className="btn-secondary"
            >
              Reset Progress
            </button>
          </div>
          
          <button 
            onClick={() => {
              console.log("🔍 Debug Info:");
              console.log("Selected Course:", selectedCourse);
              console.log("Course Content:", courseContent);
              console.log("Completion %:", completionPercentage);
              console.log("Watched Videos:", watchedVideos);
              console.log("Completed Notes:", completedNotes);
              console.log("Completed Quizzes:", completedQuizzes);
              fetchCourseContent(selectedCourse.courseId || selectedCourse.id || selectedCourse._id);
            }}
            className="btn-secondary"
            style={{marginTop: '10px'}}
          >
            Debug & Refresh
          </button>
        </div>

        <div className="content-tabs">
          <div className="tab-nav">
            <button className="tab-btn active">Videos</button>
            <button className="tab-btn">Notes</button>
            <button className="tab-btn">Quizzes</button>
          </div>

          <div className="tab-content">
            {/* Videos Tab */}
            <div className="content-section">
              <h2>Video Lectures</h2>
              {courseContent.videos.length > 0 ? (
                <div className="videos-grid">
                  {courseContent.videos.map(video => {
                    const isWatched = watchedVideos.includes(video._id);
                    return (
                      <div key={video._id} className={`video-card ${isWatched ? 'completed' : ''}`}>
                        <div className="video-thumbnail">
                          <img 
                            src={video.thumbnail || `https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`} 
                            alt={video.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
                            }}
                          />
                          <div className="play-overlay">
                            {isWatched ? (
                              <div className="completed-badge">✓ Watched</div>
                            ) : (
                              <button 
                                className="play-btn"
                                onClick={() => handleWatchVideo(video)}
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="video-info">
                          <h3>{video.title}</h3>
                          <p>{video.description}</p>
                          <div className="video-meta">
                            <span>Duration: {video.duration ? `${Math.floor(video.duration / 60)}:${video.duration % 60 < 10 ? '0' : ''}${video.duration % 60}` : 'N/A'}</span>
                            {video.module && <span>Module: {video.module}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🎬</div>
                  <h3>No Videos Available</h3>
                  <p>Video lectures will be added soon by the instructor.</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      console.log("🔄 Refreshing course content...");
                      fetchCourseContent(selectedCourse.courseId || selectedCourse.id || selectedCourse._id);
                    }}
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Notes Tab - CHANGED FROM "STUDY MATERIALS" TO "NOTES" */}
            <div className="content-section">
              <h2>Notes & Study Materials</h2>
              {courseContent.notes.length > 0 ? (
                <div className="notes-grid">
                  {courseContent.notes.map(note => {
                    const isCompleted = completedNotes.includes(note._id);
                    return (
                      <div key={note._id} className={`note-card ${isCompleted ? 'completed' : ''}`}>
                        <div className="note-icon">
                          {note.fileType === 'pdf' ? '📄' : '📝'}
                          {isCompleted && <span className="completion-check">✓</span>}
                        </div>
                        <div className="note-info">
                          <h3>{note.title}</h3>
                          <p>{note.description || 'Study material for this course'}</p>
                          <div className="note-meta">
                            <span>{note.fileType?.toUpperCase() || 'PDF'} • {note.pages || 'N/A'} pages</span>
                          </div>
                        </div>
                        <div className="note-actions">
                          <a 
                            href={`https://clinigoal-server.onrender.com${note.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-secondary"
                          >
                            Download
                          </a>
                          {!isCompleted && (
                            <button 
                              onClick={() => handleCompleteNote(note._id)}
                              className="btn-primary mark-complete-btn"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No Notes Available</h3>
                  <p>Notes and study materials will be added soon by the instructor.</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      console.log("🔄 Refreshing course content...");
                      fetchCourseContent(selectedCourse.courseId || selectedCourse.id || selectedCourse._id);
                    }}
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Quizzes Tab */}
            <div className="content-section">
              <h2>Assessments</h2>
              {courseContent.quizzes.length > 0 ? (
                <div className="quizzes-grid">
                  {courseContent.quizzes.map(quiz => {
                    const isCompleted = completedQuizzes.includes(quiz._id);
                    return (
                      <div key={quiz._id} className={`quiz-card ${isCompleted ? 'completed' : ''}`}>
                        <div className="quiz-icon">
                          ❓
                          {isCompleted && <span className="completion-check">✓</span>}
                        </div>
                        <div className="quiz-info">
                          <h3>{quiz.title}</h3>
                          <p>{quiz.description}</p>
                          <div className="quiz-meta">
                            <span>{quiz.questions?.length || 0} questions</span>
                            <span>Time: {quiz.timeLimit || 'N/A'} min</span>
                            <span>Passing: {quiz.passingScore || '70'}%</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => startQuiz(quiz)}
                          className="btn-primary"
                        >
                          {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">❓</div>
                  <h3>No Quizzes Available</h3>
                  <p>Quizzes will be added soon by the instructor.</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      console.log("🔄 Refreshing course content...");
                      fetchCourseContent(selectedCourse.courseId || selectedCourse.id || selectedCourse._id);
                    }}
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Quiz Results Display
  const renderQuizResults = () => {
    if (!quizResults) return null;

    const { score, passed, totalQuestions, correctAnswers, timeSpent, detailedResults } = quizResults;

    return (
      <div className="quiz-results">
        <div className="results-card">
          <div className="results-icon">
            {passed ? '🎉' : '📝'}
          </div>
          <h2>{passed ? 'Congratulations!' : 'Keep Learning!'}</h2>
          <div className="score-display">
            <div className={`score-circle ${passed ? 'passed' : 'failed'}`}>
              <span className="score-percent">{score}%</span>
            </div>
          </div>
          <div className="results-details">
            <p>You scored {correctAnswers} out of {totalQuestions} questions correctly.</p>
            <p>Time spent: {timeSpent}</p>
            {passed ? (
              <p className="success-text">You passed the quiz! Your progress has been updated.</p>
            ) : (
              <p className="warning-text">You need {activeQuiz.passingScore || 70}% to pass. Keep studying and try again!</p>
            )}
          </div>

          {/* Detailed Results Section */}
          <div className="detailed-results">
            <h3>Question Review</h3>
            <div className="questions-review">
              {detailedResults.map((result, index) => (
                <div key={result.questionId} className={`question-review-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                    <span className={`answer-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                    <span className="question-time">
                      ⏱️ {formatTime(result.timeSpent)}
                    </span>
                  </div>
                  <div className="question-text">
                    <p>{result.questionText}</p>
                  </div>
                  <div className="answers-comparison">
                    <div className="user-answer">
                      <span className="answer-label">Your Answer:</span>
                      <span className="answer-text">{result.selectedOption}</span>
                    </div>
                    {!result.isCorrect && (
                      <div className="correct-answer">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="answer-text">{result.correctOption}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="results-actions">
            <button onClick={resetQuiz} className="btn-primary">
              {passed ? 'Back to Course' : 'Retry Quiz'}
            </button>
            <button onClick={() => setActiveSection('my-courses')} className="btn-secondary">
              My Courses
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!activeQuiz) return null;

    if (quizResults) {
      return renderQuizResults();
    }

    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button 
            className="back-btn"
            onClick={resetQuiz}
          >
            ← Back to Course
          </button>
          <div className="quiz-title-section">
            <h1>{activeQuiz.title}</h1>
            <p className="quiz-subtitle">{activeQuiz.description || 'Test your knowledge'}</p>
          </div>
          <div className="quiz-progress">
            <span>⏱️ Time: <span id="quiz-timer">{formatTime(quizTimer)}</span></span>
            <span>❓ Question: <span id="question-counter">1 of {activeQuiz.questions?.length || 0}</span></span>
          </div>
        </div>

        <div className="quiz-content">
          <div className="quiz-instructions">
            <h3>Instructions</h3>
            <ul>
              <li>Read each question carefully before answering</li>
              <li>Select only one answer per question</li>
              <li>You can change your answer before submitting</li>
              <li>Passing score: {activeQuiz.passingScore || 70}%</li>
            </ul>
          </div>

          <div className="quiz-questions">
            {activeQuiz.questions?.map((question, questionIndex) => {
              const questionId = question._id || `q${questionIndex}`;
              const selectedAnswer = quizAnswers[questionId];
              
              return (
                <div key={questionId} className="quiz-question-card">
                  <div className="question-header">
                    <div className="question-number">
                      Question {questionIndex + 1} of {activeQuiz.questions.length}
                    </div>
                    <div className="question-required">
                      *
                    </div>
                  </div>
                  
                  <div className="question-content">
                    <div className="question-text">
                      <h4>{question.questionText}</h4>
                    </div>
                    
                    <div className="question-options">
                      {question.options?.map((option, optionIndex) => {
                        const optionId = option.id || `q${questionIndex}_opt${optionIndex}`;
                        const isSelected = selectedAnswer === optionId;
                        
                        return (
                          <div 
                            key={optionId}
                            className={`option-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(questionId, optionId)}
                          >
                            <div className="option-radio">
                              <div className={`radio-circle ${isSelected ? 'checked' : ''}`}></div>
                            </div>
                            <div className="option-text">
                              <span className="option-label">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              {option.optionText}
                            </div>
                            {isSelected && (
                              <div className="option-selected-indicator">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="quiz-actions">
            <div className="quiz-summary">
              <p>
                Answered: {Object.keys(quizAnswers).length} of {activeQuiz.questions?.length || 0} questions
              </p>
              {Object.keys(quizAnswers).length < (activeQuiz.questions?.length || 0) && (
                <p className="warning-text">
                  Please answer all questions before submitting
                </p>
              )}
            </div>
            
            <div className="quiz-buttons">
              <button 
                onClick={resetQuiz}
                className="btn-secondary"
              >
                Cancel Quiz
              </button>
              <button 
                onClick={submitQuiz}
                className="btn-primary"
                disabled={Object.keys(quizAnswers).length !== (activeQuiz.questions?.length || 0)}
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Certificate Modal
  const renderCertificateModal = () => {
    if (!showCertificateModal || !certificateData) return null;

    return (
      <div className="certificate-modal-overlay">
        <div className="certificate-modal">
          <div className="modal-header">
            <h2>🎓 Certificate Generated Successfully!</h2>
            <button 
              className="close-btn" 
              onClick={() => setShowCertificateModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="certificate-preview">
            <div className="certificate-design">
              <div className="certificate-border">
                <div className="certificate-content">
                  <div className="certificate-logo">CLINIGOAL</div>
                  <h1>CERTIFICATE OF COMPLETION</h1>
                  <p className="presented-to">This certificate is presented to</p>
                  <h2 className="student-name">{certificateData.studentName}</h2>
                  <p className="completion-text">for successfully completing the course</p>
                  <h3 className="course-title">{certificateData.courseTitle}</h3>
                  <div className="certificate-details">
                    <p>Instructor: <strong>{certificateData.instructor}</strong></p>
                    <p>Duration: <strong>{certificateData.duration}</strong></p>
                    <p>Issue Date: <strong>{new Date(certificateData.issueDate).toLocaleDateString()}</strong></p>
                  </div>
                  <div className="certificate-id">
                    Certificate ID: {certificateData.certificateId}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              onClick={() => downloadCertificateAsPDF(certificateData)}
              className="btn-primary"
            >
              📥 Download PDF
            </button>
            <button 
              onClick={() => setShowCertificateModal(false)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="clinigoal-logo">
            <h2>Clinigoal</h2>
          </div>
          
          <div className="user-profile-section">
            <div className="user-avatar-container">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="user-profile-photo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="user-avatar" style={{ display: profilePhoto ? 'none' : 'flex' }}>
                {userData.userName ? userData.userName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            <div className="user-info">
              <h3>{userData.userName || 'User Name'}</h3>
              <p>{userData.userEmail || 'user@example.com'}</p>
              <span className="user-role">Student</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeSection === 'my-courses' ? 'active' : ''}`}
            onClick={() => setActiveSection('my-courses')}
          >
            📚 My Courses
          </button>
          <button 
            className={`nav-item ${activeSection === 'available-courses' ? 'active' : ''}`}
            onClick={() => setActiveSection('available-courses')}
          >
            🎯 Available Courses
          </button>
          <button 
            className={`nav-item ${activeSection === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveSection('certificates')}
          >
            🏆 Certificates
          </button>
          <button 
            className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveSection('progress')}
          >
            📈 Progress Tracking
          </button>
          <button 
            className={`nav-item ${activeSection === 'student-review' ? 'active' : ''}`}
            onClick={() => setActiveSection('student-review')}
          >
            💬 Student Review
          </button>
          <button 
            className={`nav-item ${activeSection === 'payment-details' ? 'active' : ''}`}
            onClick={() => setActiveSection('payment-details')}
          >
            💳 Payment Details
          </button>
          <button 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout">🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {activeQuiz ? renderQuiz() : 
         activeSection === 'course-content' ? renderCourseContent() :
         activeSection === 'dashboard' ? renderDashboard() :
         activeSection === 'my-courses' ? renderMyCourses() :
         activeSection === 'available-courses' ? renderAvailableCourses() :
         activeSection === 'certificates' ? renderCertificates() :
         activeSection === 'progress' ? renderProgressTracking() :
         activeSection === 'student-review' ? renderStudentReview() :
         activeSection === 'payment-details' ? renderPaymentDetails() :
         activeSection === 'settings' ? renderSettings() :
         renderDashboard()}
      </div>

      {/* Certificate Modal */}
      {renderCertificateModal()}

      {/* Payment Details Modal */}
      {renderPaymentModal()}
    </div>
  );
}