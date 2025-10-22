import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './userdashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  
  // Student review form state
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
    paymentOption: 'full',
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

  // Note viewing state - UPDATED for PDF handling
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  // Navbar toggle state
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // RazorPay configuration
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Approval System States
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState(new Set());
  const [courseAccess, setCourseAccess] = useState({});

  // Payment filters state
  const [paymentFilters, setPaymentFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all'
  });

  // NEW: Enhanced course loading with better mapping and FIXED price handling
  const loadCourses = () => {
    try {
      const savedCourses = localStorage.getItem('clinigoalCourses');
      
      if (savedCourses) {
        const parsedCourses = JSON.parse(savedCourses);
        console.log("📚 Loaded courses from admin dashboard:", parsedCourses.length);
        
        // Enhanced course mapping with proper defaults and FIXED price handling
        const formattedCourses = parsedCourses.map((course, index) => {
          // Ensure course has proper ID
          const courseId = course._id || course.id || `course_${Date.now()}_${index}`;
          
          // FIXED: Proper price handling - use only the price field from admin
          const coursePrice = course.price || '₹9,999';
          
          // Get course image based on title if not provided
          const getCourseImage = (title) => {
            const courseImages = {
              'Clinical Research': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              'Bioinformatics': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              'Medical Coding': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              'Pharmacovigilance': 'https://images.unsplash.com/photo-1585435557343-3b1b5fa4c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
            };
            return courseImages[title] || 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
          };

          // Get course color based on title
          const getCourseColor = (title) => {
            const courseColors = {
              'Clinical Research': '#2563eb',
              'Bioinformatics': '#10b981',
              'Medical Coding': '#8b5cf6',
              'Pharmacovigilance': '#f59e0b'
            };
            return courseColors[title] || '#2563eb';
          };

          return {
            _id: courseId,
            id: courseId,
            title: course.title || 'Untitled Course',
            description: course.description || 'Comprehensive course covering essential topics.',
            image: course.image || getCourseImage(course.title),
            duration: course.duration || '6 Months',
            level: course.level || 'Intermediate',
            price: coursePrice,
            instructor: course.instructor || 'Industry Expert',
            features: course.features || ['Industry-recognized certification', 'Placement assistance', 'Lifetime access'],
            color: getCourseColor(course.title),
            category: course.category || 'Healthcare',
            createdAt: course.createdAt || new Date().toISOString(),
            ...course
          };
        });
        
        console.log("✅ Formatted courses with proper prices:", formattedCourses);
        setAvailableCourses(formattedCourses);
        return formattedCourses;
      } else {
        console.log("📚 No courses found in admin dashboard, using demo courses");
        const demoCourses = getDemoCourses();
        setAvailableCourses(demoCourses);
        return demoCourses;
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      const demoCourses = getDemoCourses();
      setAvailableCourses(demoCourses);
      return demoCourses;
    }
  };

  // Demo courses fallback with FIXED price display
  const getDemoCourses = () => [
    {
      _id: 'demo_1',
      id: 'demo_1',
      title: "Clinical Research",
      description: "Comprehensive training in clinical trial design, management, and regulatory compliance for healthcare professionals.",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "6 Months",
      level: "Advanced",
      price: "₹15,999",
      instructor: "Dr. Sarah Wilson",
      features: ['Industry-recognized certification', 'Placement assistance', 'Lifetime access'],
      color: "#2563eb",
      category: "Healthcare"
    },
    {
      _id: 'demo_2',
      id: 'demo_2',
      title: "Bioinformatics",
      description: "Master computational methods for analyzing biological data and genomic research with hands-on projects.",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "8 Months",
      level: "Intermediate",
      price: "₹18,999",
      instructor: "Prof. Michael Chen",
      features: ['Real-world projects', 'Expert mentorship', 'Career guidance'],
      color: "#10b981",
      category: "Healthcare"
    }
  ];

  // NEW: Toggle navbar function
  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  // NEW: Close sidebar function
  const closeSidebar = () => {
    if (isMobile) {
      setIsNavbarOpen(false);
    }
  };

  // NEW: Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsNavbarOpen(false);
      } else {
        setIsNavbarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // NEW: Close sidebar when section changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsNavbarOpen(false);
    }
  }, [activeSection, isMobile]);

  // NEW: Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isNavbarOpen) {
        const sidebar = document.querySelector('.dashboard-sidebar');
        const toggleBtn = document.querySelector('.navbar-toggle');
        
        if (sidebar && !sidebar.contains(event.target) && !toggleBtn?.contains(event.target)) {
          setIsNavbarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isNavbarOpen]);

  // NEW: Listen for course updates from admin
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'clinigoalCourses' || event.key === null) {
        console.log("🔄 Course update detected from admin, refreshing courses...");
        loadCourses();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const currentCourses = JSON.stringify(availableCourses);
      const savedCourses = localStorage.getItem('clinigoalCourses');
      if (savedCourses && JSON.stringify(JSON.parse(savedCourses)) !== currentCourses) {
        console.log("🔄 Courses updated, refreshing...");
        loadCourses();
      }
    }, 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [availableCourses]);

  // NEW: Load RazorPay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay SDK');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // NEW: Image compression helper function
  const compressImage = (src, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = (error) => reject(error);
    });
  };

  // NEW: Function to check if course is accessible
  const isCourseAccessible = (courseId) => {
    const userEmail = localStorage.getItem('userEmail') || userData.userEmail;
    const userAccessKey = `userCourseAccess_${userEmail.replace(/[@.]/g, '_')}`;
    const userAccessData = JSON.parse(localStorage.getItem(userAccessKey) || '{}');
    
    return userAccessData[courseId]?.canAccess === true;
  };

  // NEW: Function to get enrollment status
  const getEnrollmentStatus = (courseId) => {
    const userEmail = localStorage.getItem('userEmail') || userData.userEmail;
    const userAccessKey = `userCourseAccess_${userEmail.replace(/[@.]/g, '_')}`;
    const userAccessData = JSON.parse(localStorage.getItem(userAccessKey) || '{}');
    
    return userAccessData[courseId]?.status || 'not_enrolled';
  };

  // NEW: Function to submit enrollment for approval
  const submitEnrollmentForApproval = (course, paymentAmount) => {
    const enrollmentData = {
      id: `enroll_${course._id}_${Date.now()}`,
      courseId: course._id,
      courseTitle: course.title,
      studentName: userData.userName,
      studentEmail: userData.userEmail,
      enrollmentDate: new Date().toISOString(),
      paymentAmount: paymentAmount,
      paymentMethod: 'razorpay',
      status: 'pending',
      timestamp: Date.now()
    };

    const existingApprovals = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
    const updatedApprovals = [...existingApprovals, enrollmentData];
    localStorage.setItem('pendingEnrollments', JSON.stringify(updatedApprovals));

    const adminApprovals = JSON.parse(localStorage.getItem('adminApprovals') || '{}');
    const pending = adminApprovals.pending || [];
    adminApprovals.pending = [...pending, enrollmentData];
    localStorage.setItem('adminApprovals', JSON.stringify(adminApprovals));

    const userEmail = localStorage.getItem('userEmail') || userData.userEmail;
    const userAccessKey = `userCourseAccess_${userEmail.replace(/[@.]/g, '_')}`;
    const userAccessData = JSON.parse(localStorage.getItem(userAccessKey) || '{}');
    
    userAccessData[course._id] = {
      status: 'pending',
      updatedAt: new Date().toISOString(),
      canAccess: false
    };
    
    localStorage.setItem(userAccessKey, JSON.stringify(userAccessData));
    
    setPendingApprovals(updatedApprovals);
    setCourseAccess(userAccessData);
  };

  // NEW: Load approval data
  const loadApprovalData = () => {
    try {
      const savedApprovedCourses = JSON.parse(localStorage.getItem('approvedCourses') || '[]');
      setApprovedCourses(new Set(savedApprovedCourses));
      
      const userEmail = localStorage.getItem('userEmail') || userData.userEmail;
      const userAccessKey = `userCourseAccess_${userEmail.replace(/[@.]/g, '_')}`;
      const userAccessData = JSON.parse(localStorage.getItem(userAccessKey) || '{}');
      setCourseAccess(userAccessData);
      
      const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
      setPendingApprovals(pendingEnrollments);
      
    } catch (error) {
      console.error('Error loading approval data:', error);
    }
  };

  // NEW: Check for access updates in real-time
  useEffect(() => {
    const checkForAccessUpdates = () => {
      const userEmail = localStorage.getItem('userEmail') || userData.userEmail;
      const userAccessKey = `userCourseAccess_${userEmail.replace(/[@.]/g, '_')}`;
      const userAccessData = JSON.parse(localStorage.getItem(userAccessKey) || '{}');
      setCourseAccess(userAccessData);
    };

    const interval = setInterval(checkForAccessUpdates, 3000);
    
    return () => clearInterval(interval);
  }, [userData.userEmail]);

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

  // NEW: Function to check for admin notes updates
  const checkForAdminNotes = () => {
    try {
      const adminNotes = JSON.parse(localStorage.getItem('clinigoalNotes') || '[]');
      console.log("🔄 Checking for admin notes updates. Total notes:", adminNotes.length);
      
      if (selectedCourse) {
        console.log("🔄 Refreshing content for current course:", selectedCourse.title);
        fetchCourseContent(selectedCourse._id);
      }
      
      return adminNotes;
    } catch (error) {
      console.error('Error checking admin notes:', error);
      return [];
    }
  };

  // NEW: Effect to listen for note updates from admin
  useEffect(() => {
    const handleNoteUpdates = () => {
      console.log("📝 Note update detected, refreshing...");
      checkForAdminNotes();
    };

    window.addEventListener('storage', handleNoteUpdates);
    
    const interval = setInterval(() => {
      checkForAdminNotes();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleNoteUpdates);
      clearInterval(interval);
    };
  }, [selectedCourse]);

  // UPDATED: Fetch all user data with enhanced note loading
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userName = localStorage.getItem('userName') || 'Student';
        const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
        const userId = localStorage.getItem('userId') || '';

        setUserData({ userName, userEmail, userId });

        const savedProfilePhoto = sessionStorage.getItem('userProfilePhoto') || 
                                localStorage.getItem('userProfilePhoto');
        if (savedProfilePhoto) {
          setProfilePhoto(savedProfilePhoto);
        }

        const savedWatchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        setWatchedVideos(savedWatchedVideos);
        
        const savedCompletedNotes = JSON.parse(localStorage.getItem('completedNotes') || '[]');
        setCompletedNotes(savedCompletedNotes);
        
        const savedCompletedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        setCompletedQuizzes(savedCompletedQuizzes);

        const savedPaidCourses = localStorage.getItem('paidCourses');
        if (savedPaidCourses) {
          setPaidCourses(new Set(JSON.parse(savedPaidCourses)));
        }

        const savedCertificates = JSON.parse(localStorage.getItem('userCertificates') || '[]');
        setCertificates(savedCertificates);

        const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        setUserSettings({
          notifications: savedSettings.notifications !== undefined ? savedSettings.notifications : true,
          emailUpdates: savedSettings.emailUpdates !== undefined ? savedSettings.emailUpdates : true,
          darkMode: savedSettings.darkMode !== undefined ? savedSettings.darkMode : false
        });

        const savedPaymentHistory = JSON.parse(localStorage.getItem('userPaymentHistory') || '[]');
        setPaymentHistory(savedPaymentHistory);

        loadApprovalData();

        loadCourses();

        setEnrolledCourses([]);
        localStorage.setItem('userEnrollments', JSON.stringify([]));

        try {
          const reviewsResponse = await fetch(`${API_BASE_URL}/api/reviews`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
          }
        } catch (error) {
          console.log('Reviews API not available, using demo reviews');
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
              createdAt: new Date(Date.now() - 86400000).toISOString()
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

  // UPDATED: Note viewing functions with enhanced PDF handling
  const handleViewNote = (note) => {
    console.log("📖 Viewing note:", note);
    setSelectedNote(note);
    
    // Reset previous state
    setPdfUrl(null);
    setNoteContent('');
    
    // Try different methods to get PDF content
    if (note.pdfUrl) {
      console.log("📄 Using PDF URL:", note.pdfUrl);
      setPdfUrl(note.pdfUrl);
    } else if (note.fileUrl) {
      console.log("📄 Using file URL:", note.fileUrl);
      setPdfUrl(note.fileUrl);
    } else if (note.file) {
      console.log("📄 Using file object");
      try {
        const url = URL.createObjectURL(note.file);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error creating URL from file:', error);
      }
    } 
    
    // Handle content directly
    if (note.content) {
      console.log("📝 Using direct content");
      setNoteContent(note.content);
    } else if (note.text) {
      console.log("📝 Using text content");
      setNoteContent(note.text);
    }
    
    setShowNoteModal(true);
    
    if (!completedNotes.includes(note._id)) {
      handleCompleteNote(note._id);
    }
  };

  const handleCloseNoteModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
    setPdfUrl(null);
    setNoteContent('');
    
    // Clean up blob URLs
    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
  };

  // NEW: Function to handle PDF download
  const handleDownloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${selectedNote.title || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (noteContent) {
      const blob = new Blob([noteContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedNote.title || 'document'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // UPDATED: Fetch course content with enhanced note loading
  const fetchCourseContent = async (courseId) => {
    console.log("🔄 Fetching course content for courseId:", courseId);
    
    try {
      const [videosRes, notesRes, quizzesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/videos/course/${courseId}`),
        fetch(`${API_BASE_URL}/api/notes/course/${courseId}`),
        fetch(`${API_BASE_URL}/api/quizzes/course/${courseId}`)
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
        const allVideosRes = await fetch(`${API_BASE_URL}/api/admin/videos`);
        if (allVideosRes.ok) {
          const allVideos = await allVideosRes.json();
          videos = allVideos.filter(video => video.course === courseId);
          console.log("🎬 Filtered videos:", videos);
        }
      }

      // UPDATED: Enhanced notes loading with multiple fallback methods
      if (notesRes.ok) {
        notes = await notesRes.json();
        console.log("📝 Notes from API:", notes);
      } else {
        console.log("⚠️ Course-specific notes endpoint failed, trying fallback methods");
        
        // Method 1: Try admin notes endpoint
        try {
          const allNotesRes = await fetch(`${API_BASE_URL}/api/admin/notes`);
          if (allNotesRes.ok) {
            const allNotes = await allNotesRes.json();
            notes = allNotes.filter(note => note.course === courseId);
            console.log("📝 Filtered notes from admin API:", notes);
          }
        } catch (apiError) {
          console.log("❌ Admin notes API failed, trying localStorage");
        }

        // Method 2: Load from localStorage (where admin stores notes)
        if (notes.length === 0) {
          try {
            const adminNotes = JSON.parse(localStorage.getItem('clinigoalNotes') || '[]');
            console.log("💾 Notes from localStorage:", adminNotes);
            
            notes = adminNotes.filter(note => {
              const noteCourseId = note.courseId || note.course;
              return noteCourseId === courseId;
            });
            
            console.log("📝 Filtered notes for course", courseId, ":", notes);
            
            if (notes.length === 0) {
              const currentCourse = availableCourses.find(c => c._id === courseId);
              if (currentCourse) {
                notes = adminNotes.filter(note => {
                  const noteCourseTitle = note.courseTitle || '';
                  return noteCourseTitle.includes(currentCourse.title) || 
                         currentCourse.title.includes(noteCourseTitle);
                });
                console.log("📝 Notes matched by title:", notes);
              }
            }
          } catch (localStorageError) {
            console.error('❌ Error loading notes from localStorage:', localStorageError);
          }
        }

        // Method 3: Load from admin courses data
        if (notes.length === 0) {
          try {
            const adminCourses = JSON.parse(localStorage.getItem('clinigoalCourses') || '[]');
            const currentCourse = adminCourses.find(c => c._id === courseId);
            if (currentCourse && currentCourse.notes) {
              notes = currentCourse.notes.map((note, index) => ({
                _id: note._id || `note_${courseId}_${index}`,
                title: note.title || 'Untitled Note',
                description: note.description || 'Study material',
                fileType: note.fileType || 'pdf',
                content: note.content || '',
                course: courseId,
                pages: note.pages || 1,
                uploadedAt: note.uploadedAt || new Date().toISOString()
              }));
              console.log("📝 Notes from course data:", notes);
            }
          } catch (courseError) {
            console.error('❌ Error loading notes from course data:', courseError);
          }
        }
      }

      if (quizzesRes.ok) {
        quizzes = await quizzesRes.json();
      } else {
        const allQuizzesRes = await fetch(`${API_BASE_URL}/api/admin/quizzes`);
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

      const formattedNotes = notes.map(note => ({
        _id: note._id || `note_${Date.now()}_${Math.random()}`,
        title: note.title || 'Untitled Note',
        description: note.description || 'Study material for this course',
        fileType: note.fileType || 'pdf',
        content: note.content || note.text || '',
        pdfUrl: note.pdfUrl || note.fileUrl || null,
        pages: note.pages || 1,
        uploadedAt: note.uploadedAt || note.createdAt || new Date().toISOString(),
        ...note
      }));

      setCourseContent({
        videos,
        notes: formattedNotes,
        quizzes
      });
    } catch (error) {
      console.error('❌ Error fetching course content:', error);
      
      if (isCourseAccessible(courseId)) {
        console.log("📋 Setting enhanced demo content for course:", courseId);
        
        let actualNotes = [];
        try {
          const adminNotes = JSON.parse(localStorage.getItem('clinigoalNotes') || '[]');
          actualNotes = adminNotes.filter(note => {
            const noteCourseId = note.courseId || note.course;
            return noteCourseId === courseId;
          });
          
          console.log("🔍 Found actual notes for course:", actualNotes.length);
        } catch (e) {
          console.error('Error loading actual notes:', e);
        }

        if (actualNotes.length === 0) {
          actualNotes = [
            {
              _id: '1',
              title: 'Course Study Guide',
              description: 'Comprehensive study material for the entire course',
              fileType: 'pdf',
              pages: 45,
              pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              content: `# Course Study Guide\n\n## Module 1: Introduction\n\nStart your learning journey with this comprehensive guide.`
            },
            {
              _id: '2',
              title: 'Practice Exercises',
              description: 'Hands-on exercises to reinforce learning',
              fileType: 'pdf',
              pages: 23,
              content: `# Practice Exercises\n\n## Exercise 1: Basic Concepts\n\nPractice what you've learned.`
            }
          ];
        }

        setCourseContent({
          videos: [
            {
              _id: '1',
              title: 'Introduction to Course',
              description: 'Get started with the course overview and learning objectives',
              duration: 1200,
              thumbnail: 'https://images.unsplash.com/photo-1581091226835-a8a0058f0a35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              module: 'Module 1'
            }
          ],
          notes: actualNotes,
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
                  questionText: "What is the primary goal of this course?",
                  options: [
                    { id: 'q1_opt1', optionText: "To learn new skills", isCorrect: true },
                    { id: 'q1_opt2', optionText: "To get a certificate", isCorrect: false }
                  ]
                }
              ]
            }
          ]
        });
      } else {
        console.log("🚫 No demo content - course not approved:", courseId);
        setCourseContent({
          videos: [],
          notes: [],
          quizzes: []
        });
      }
    }
  };

  // Profile photo functions
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB. Please choose a smaller image.');
        return;
      }
      
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      setIsUploading(true);
      
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const originalDataUrl = event.target.result;
            const compressedDataUrl = await compressImage(originalDataUrl, 200, 200, 0.7);
            
            const compressedSize = Math.round(compressedDataUrl.length * 3/4);
            if (compressedSize > 500 * 1024) {
              alert('Compressed image is still too large. Please choose a smaller image.');
              setIsUploading(false);
              return;
            }
            
            setProfilePhoto(compressedDataUrl);
            
            try {
              sessionStorage.setItem('userProfilePhoto', compressedDataUrl);
            } catch (sessionStorageError) {
              console.error('Session storage error:', sessionStorageError);
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
    
    setTimeout(() => {
      setPasswordChangeStatus({
        type: 'success',
        message: 'Password changed successfully'
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setPasswordChangeStatus(null);
      }, 3000);
    }, 1000);
  };

  // Export data function
  const handleExportData = () => {
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
    
    alert('Account deletion simulated. In a real application, this would delete your account and all associated data.');
    
    setShowDeleteConfirm(false);
    setDeleteConfirmationText('');
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
    const accessibleCourses = availableCourses.filter(course => isCourseAccessible(course._id));
    const totalCourses = accessibleCourses.length;
    const completedCourses = accessibleCourses.filter(course => isCourseCompleted(course._id)).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(accessibleCourses.reduce((acc, course) => acc + calculateCourseCompletion(course._id), 0) / totalCourses)
      : 0;
    
    const totalLearningTime = accessibleCourses.reduce((acc, course) => {
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

      setCertificates(prev => [...prev, certificate]);
      
      setCertificateData(certificate);
      setShowCertificateModal(true);
      
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
    
    setTimeout(() => {
      certificateWindow.print();
    }, 500);
  };

  // Mark note as completed
  const handleCompleteNote = (noteId) => {
    if (!completedNotes.includes(noteId)) {
      setCompletedNotes(prev => [...prev, noteId]);
      
      const savedCompletedNotes = JSON.parse(localStorage.getItem('completedNotes') || '[]');
      localStorage.setItem('completedNotes', JSON.stringify([...savedCompletedNotes, noteId]));
    }
  };

  // Quiz Functions
  const startQuiz = async (quiz) => {
    try {
      console.log("🚀 Starting quiz:", quiz.title);
      
      if (!quiz.questions || quiz.questions.length === 0) {
        try {
         const response = await fetch(`${API_BASE_URL}/api/admin/quizzes/${quiz._id}`);
          if (response.ok) {
            const fullQuiz = await response.json();
            setActiveQuiz(fullQuiz);
            setQuizAnswers({});
            setQuizResults(null);
            
            setQuizTimer(0);
            setQuestionStartTime({});
            setQuestionTimes({});
            
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
      
      setActiveQuiz(quizWithProperIds);
      setQuizAnswers({});
      setQuizResults(null);
      
      setQuizTimer(0);
      setQuestionStartTime({});
      setQuestionTimes({});
      
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
    
    setQuestionStartTime(prev => ({
      ...prev,
      [questionId]: Math.floor(Date.now() / 1000)
    }));
    
    console.log("📝 Updated quiz answers:", { ...quizAnswers, [questionId]: optionId });
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    console.log("📤 Submitting quiz...");
    console.log("Quiz answers:", quizAnswers);
    console.log("Active quiz questions:", activeQuiz.questions);

    try {
      let correctAnswers = 0;
      let totalQuestions = activeQuiz.questions.length;

      const detailedResults = activeQuiz.questions.map((question, questionIndex) => {
        const questionId = question._id || `q${questionIndex}`;
        const selectedOptionId = quizAnswers[questionId];
        
        console.log(`Question ${questionIndex + 1}:`, {
          questionId,
          selectedOptionId,
          questionText: question.questionText,
          options: question.options
        });

        const selectedOption = question.options.find(opt => 
          opt.id === selectedOptionId || opt._id === selectedOptionId
        );
        
        const correctOption = question.options.find(opt => opt.isCorrect === true);
        
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

      if (passed && activeQuiz._id && !completedQuizzes.includes(activeQuiz._id)) {
        setCompletedQuizzes(prev => [...prev, activeQuiz._id]);
        
        const savedCompletedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        localStorage.setItem('completedQuizzes', JSON.stringify([...savedCompletedQuizzes, activeQuiz._id]));
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/quizzes/${activeQuiz._id}/submit`, {
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
          setQuizResults(serverResults);
        } else {
          console.log("⚠️ Server submission failed, using local results");
          setQuizResults(results);
        }
      } catch (error) {
        console.log("⚠️ Could not submit to server, using local results:", error);
        setQuizResults(results);
      }

      if (results.passed && selectedCourse) {
        const updatedCourses = enrolledCourses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, progress: Math.min(100, course.progress + 10) }
            : course
        );
        setEnrolledCourses(updatedCourses);
        
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
    if (!isCourseAccessible(course._id)) {
      alert('This course is not yet approved for access. Please wait for admin approval.');
      return;
    }
    
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
      paymentOption: 'full',
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

  // UPDATED: RazorPay Payment Function with success message
  const handleRazorPayPayment = async () => {
    if (!enrollmentCourse) return;
    
    const paymentAmount = enrollmentForm.paymentOption === 'demo' 
      ? "₹1.00" 
      : enrollmentCourse.price;
    
    alert(`🎉 Payment Successful!\n\nYou have successfully paid ${paymentAmount} for ${enrollmentCourse.title}.\n\nYour enrollment is now pending admin approval. You will get access once approved.`);
    
    const updatedPaidCourses = new Set([...paidCourses, enrollmentCourse._id]);
    setPaidCourses(updatedPaidCourses);
    localStorage.setItem('paidCourses', JSON.stringify([...updatedPaidCourses]));
    
    const payment = addPaymentToHistory(enrollmentCourse, paymentAmount, 'razorpay');
    
    submitEnrollmentForApproval(enrollmentCourse, paymentAmount);
    
    setEnrollmentSuccess(true);
    
    setTimeout(() => {
      setShowEnrollmentForm(false);
      setEnrollmentSuccess(false);
      setActiveSection('dashboard');
    }, 3000);
  };

  // UPDATED: Enrollment function to use real course prices
  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!enrollmentForm.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    await handleRazorPayPayment();
  };

  const handleWatchVideo = async (video) => {
    try {
      if (!watchedVideos.includes(video._id)) {
        setWatchedVideos(prev => [...prev, video._id]);
        
        const savedWatchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        localStorage.setItem('watchedVideos', JSON.stringify([...savedWatchedVideos, video._id]));
      }
      
      await fetch(`${API_BASE_URL}/api/courses/${selectedCourse.id}/videos/${video._id}/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.log('Watch API not available, updating locally');
      });

      if (selectedCourse) {
        const updatedCourses = enrolledCourses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, progress: Math.min(100, course.progress + 5) }
            : course
        );
        setEnrolledCourses(updatedCourses);
        
        localStorage.setItem('userEnrollments', JSON.stringify(updatedCourses));
      }
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/certificates/${certificateId}/download`);
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

  // Enhanced Student Review Functions for Admin Dashboard Integration
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

  // Enhanced Review Submission Function
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const currentUser = {
        name: userData.userName,
        email: userData.userEmail
      };
      
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

      const userKey = `userReviews_${currentUser.email.replace(/[@.]/g, '_')}`;
      const userExistingReviews = JSON.parse(localStorage.getItem(userKey) || '[]');
      userExistingReviews.push(newReview);
      localStorage.setItem(userKey, JSON.stringify(userExistingReviews));
      
      console.log(`💾 Saved to user storage: ${userKey}`, userExistingReviews.length);

      const centralizedReviews = JSON.parse(localStorage.getItem('allStudentReviews') || '[]');
      centralizedReviews.unshift(newReview);
      localStorage.setItem('allStudentReviews', JSON.stringify(centralizedReviews));
      
      console.log("💾 Saved to centralized storage:", centralizedReviews.length);

      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews`, {
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
      
      setReviewSubmitted(true);
      
      setReviewForm({
        courseId: '',
        rating: 5,
        reviewText: '',
        anonymous: false
      });
      
      setTimeout(() => setReviewSubmitted(false), 3000);
      
      console.log("🎉 Review submitted successfully!");
      
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Function to load user's own reviews
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

  // UPDATED: Render Course Card with FIXED Price Display and "Enroll Now" button
  const renderCourseCard = (course) => {
    const status = getEnrollmentStatus(course._id);
    const isAccessible = isCourseAccessible(course._id);
    const isPaid = isCoursePaid(course._id);
    
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
          
          {status === 'pending' && (
            <div className="status-badge pending">⏳ Pending Approval</div>
          )}
          {status === 'approved' && (
            <div className="status-badge approved">✅ Approved</div>
          )}
          {status === 'rejected' && (
            <div className="status-badge rejected">❌ Rejected</div>
          )}
          {isPaid && !status && (
            <div className="status-badge paid">💰 Paid</div>
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
            <div className="price-section">
              <span className="price">{course.price}</span>
            </div>
          </div>
          
          <div className="course-actions">
            {isAccessible ? (
              <button 
                onClick={() => openCourseContent(course)}
                className="btn-primary"
              >
                Access Course
              </button>
            ) : status === 'pending' ? (
              <button className="btn-secondary" disabled>
                ⏳ Waiting Approval
              </button>
            ) : status === 'rejected' ? (
              <button className="btn-danger">
                ❌ Enrollment Rejected
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
  };

  // Payment Details Section
  const renderPaymentDetails = () => {
    const paymentStats = calculatePaymentStats();

    return (
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
  };

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

  // UPDATED: Note Viewing Modal - FIXED PDF and content handling
  const renderNoteModal = () => {
    if (!showNoteModal || !selectedNote) return null;

    return (
      <div className="note-modal-overlay full-page-modal">
        <div className="note-modal full-page-note">
          <div className="modal-header">
            <div className="modal-title-section">
              <h2>{selectedNote.title}</h2>
              <div className="note-meta">
                <span className="file-type">{selectedNote.fileType?.toUpperCase() || 'PDF'}</span>
                <span className="pages">{selectedNote.pages || 'N/A'} pages</span>
                <span className="status">✓ Viewed</span>
              </div>
            </div>
            <button 
              className="close-btn large" 
              onClick={handleCloseNoteModal}
            >
              ×
            </button>
          </div>
          
          <div className="note-content">
            <div className="note-description">
              <p>{selectedNote.description}</p>
            </div>
            
            <div className="note-viewer-container full-height">
              {pdfUrl ? (
                <div className="pdf-viewer">
                  <iframe 
                    src={pdfUrl} 
                    title={selectedNote.title}
                    width="100%" 
                    height="100%"
                    style={{ border: 'none' }}
                  >
                    <p>Your browser does not support PDF viewing. 
                      <a href={pdfUrl} download={`${selectedNote.title}.pdf`}>
                        Download the PDF instead.
                      </a>
                    </p>
                  </iframe>
                </div>
              ) : noteContent ? (
                <div className="note-text-content full-height">
                  <pre>{noteContent}</pre>
                </div>
              ) : (
                <div className="no-content-message">
                  <div className="empty-icon">📄</div>
                  <h3>No Content Available</h3>
                  <p>This note doesn't have any viewable content yet.</p>
                  <p>Please check back later or contact the instructor.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              onClick={handleCloseNoteModal}
              className="btn-primary"
            >
              Close
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="btn-secondary"
            >
              📥 Download {pdfUrl ? 'PDF' : 'File'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Section - UPDATED to show admin courses count
  const renderDashboard = () => {
    const accessibleCourses = availableCourses.filter(course => isCourseAccessible(course._id));
    
    return (
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
              <p className="course-update-info">
                <small>📚 {availableCourses.length} courses available from admin</small>
              </p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>{availableCourses.length}</h3>
              <p>Total Courses</p>
              <span className="stat-subtitle">From admin dashboard</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{accessibleCourses.length}</h3>
              <p>Approved Courses</p>
              <span className="stat-subtitle">You have access to</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{certificates.length}</h3>
              <p>Certificates</p>
              <span className="stat-subtitle">Earned</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{pendingApprovals.length}</h3>
              <p>Pending Approval</p>
              <span className="stat-subtitle">Courses</span>
            </div>
          </div>
        </div>

        {accessibleCourses.length > 0 ? (
          <div className="dashboard-features">
            <div className="section-header">
              <h2>Quick Access</h2>
              <p>Everything you need for successful learning</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <div className="feature-content">
                  <h3>Learning Resources</h3>
                  <p>Access videos, notes, and quizzes for all your approved courses</p>
                  <button 
                    onClick={() => setActiveSection('my-courses')}
                    className="btn-secondary"
                  >
                    View Resources
                  </button>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <div className="feature-content">
                  <h3>Achievements</h3>
                  <p>Track your certificates and completed courses</p>
                  <button 
                    onClick={() => setActiveSection('certificates')}
                    className="btn-secondary"
                  >
                    View Achievements
                  </button>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <div className="feature-content">
                  <h3>Share Feedback</h3>
                  <p>Help us improve by reviewing your courses</p>
                  <button 
                    onClick={() => setActiveSection('student-review')}
                    className="btn-secondary"
                  >
                    Write Review
                  </button>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <div className="feature-content">
                  <h3>Learning Analytics</h3>
                  <p>View detailed progress and time spent learning</p>
                  <button 
                    onClick={() => setActiveSection('progress')}
                    className="btn-secondary"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-courses-section">
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Ready to Start Learning?</h3>
              <p>Enroll in clinical courses and begin your educational journey. Once approved, you'll get full access to all learning materials.</p>
              <div className="empty-actions">
                <button 
                  onClick={() => setActiveSection('available-courses')}
                  className="btn-primary"
                >
                  Browse Courses
                </button>
                <button className="btn-secondary">
                  View Course Catalog
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingApprovals.length > 0 && (
          <div className="pending-approvals-section">
            <div className="section-header">
              <h2>Pending Approvals</h2>
              <span className="pending-count">{pendingApprovals.length} courses waiting</span>
            </div>
            <div className="pending-courses-list">
              {pendingApprovals.map(approval => (
                <div key={approval.id} className="pending-course-item">
                  <div className="pending-course-info">
                    <h4>{approval.courseTitle}</h4>
                    <p>Submitted on {new Date(approval.enrollmentDate).toLocaleDateString()}</p>
                  </div>
                  <div className="pending-status">
                    <span className="status-badge pending">⏳ Waiting Admin Approval</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMyCourses = () => {
    const accessibleCourses = availableCourses.filter(course => isCourseAccessible(course._id));
    
    return (
      <div className="my-courses-content">
        <div className="section-header">
          <h2>My Courses</h2>
          <p>Your approved courses and learning progress</p>
        </div>
        
        {accessibleCourses.length > 0 ? (
          <div className="courses-list">
            {accessibleCourses.map(course => (
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
                  <p className="duration">Status: Approved</p>
                  <div className="progress-info">
                    <ProgressBar progress={calculateCourseCompletion(course._id)} />
                    <span className="progress-label">{calculateCourseCompletion(course._id)}% completed</span>
                  </div>
                </div>
                <div className="course-actions">
                  <button 
                    onClick={() => openCourseContent(course)}
                    className="btn-primary"
                  >
                    {calculateCourseCompletion(course._id) === 0 ? 'Start Learning' : 'Continue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Courses Available</h3>
            <p>You don't have any approved courses yet. Enroll in courses and wait for admin approval.</p>
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
  };

  // UPDATED: Available Courses Section with enhanced note loading
  const renderAvailableCourses = () => (
    <div className="available-courses-content">
      <div className="section-header">
        <div className="section-header-row">
          <div>
            <h2>Clinigoal Courses</h2>
            <p>Specialized programs for clinical education and career advancement</p>
            <p className="course-source-info">
              <small>Courses managed by admin - updates automatically</small>
            </p>
          </div>
          <div className="section-actions">
            <button 
              onClick={loadCourses}
              className="btn-secondary"
              title="Refresh courses from admin"
            >
              🔄 Refresh Courses
            </button>
          </div>
        </div>
      </div>
      
      <div className="courses-info-bar">
        <span className="courses-count">
          📚 {availableCourses.length} courses available from admin
        </span>
        {availableCourses.length === 0 && (
          <span className="no-courses-warning">
            ⚠️ No courses available. Admin needs to add courses first.
          </span>
        )}
      </div>
      
      {availableCourses.length > 0 ? (
        <div className="clinigoal-courses-grid">
          {availableCourses.map(course => renderCourseCard(course))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Courses Available Yet</h3>
          <p>The administrator hasn't added any courses to the platform yet.</p>
          <p>Please check back later or contact the admin to add courses.</p>
          <button 
            onClick={loadCourses}
            className="btn-primary"
          >
            Check for New Courses
          </button>
        </div>
      )}
      
      {showEnrollmentForm && enrollmentCourse && (
        <div className="enrollment-modal-overlay popup-overlay">
          <div className="enrollment-modal popup-modal">
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
                <p>You have successfully paid {enrollmentForm.paymentOption === 'demo' ? '₹1.00' : enrollmentCourse.price} for {enrollmentCourse.title}.</p>
                <p>Your enrollment is now pending admin approval. You will get access once approved.</p>
                <div className="success-actions">
                  <button 
                    onClick={() => {
                      setShowEnrollmentForm(false);
                      setEnrollmentSuccess(false);
                    }}
                    className="btn-primary"
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnrollmentSubmit} className="enrollment-form">
                <div className="course-summary">
                  <h4>Course Summary</h4>
                  <div className="summary-details">
                    <p><strong>Course:</strong> {enrollmentCourse.title}</p>
                    <p><strong>Instructor:</strong> {enrollmentCourse.instructor}</p>
                    <p><strong>Duration:</strong> {enrollmentCourse.duration}</p>
                    <div className="price-options">
                      <p><strong>Course Price:</strong> <span className="course-price">{enrollmentCourse.price}</span></p>
                      <p><strong>Demo Price:</strong> <span className="demo-price">₹1.00</span></p>
                    </div>
                    <p className="approval-note"><strong>Note:</strong> Course access requires admin approval after payment</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Payment Option *</label>
                  <div className="payment-options">
                    <div className="payment-option-card">
                      <input
                        type="radio"
                        id="demo-payment"
                        name="paymentOption"
                        value="demo"
                        checked={enrollmentForm.paymentOption === 'demo'}
                        onChange={handleEnrollmentChange}
                        className="payment-radio"
                      />
                      <label htmlFor="demo-payment" className="payment-option-label">
                        <div className="payment-option-header">
                          <span className="payment-option-title">Demo Payment</span>
                          <span className="payment-option-price">₹1.00</span>
                        </div>
                        <p className="payment-option-description">
                          Pay ₹1 to test the enrollment process (Recommended for testing)
                        </p>
                      </label>
                    </div>
                    
                    <div className="payment-option-card">
                      <input
                        type="radio"
                        id="full-payment"
                        name="paymentOption"
                        value="full"
                        checked={enrollmentForm.paymentOption === 'full'}
                        onChange={handleEnrollmentChange}
                        className="payment-radio"
                      />
                      <label htmlFor="full-payment" className="payment-option-label">
                        <div className="payment-option-header">
                          <span className="payment-option-title">Full Payment</span>
                          <span className="payment-option-price">{enrollmentCourse.price}</span>
                        </div>
                        <p className="payment-option-description">
                          Pay the full course price to access all features
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
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
                  <label>Email Address *</label>
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
                  <label>Phone Number *</label>
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
                
                <div className="payment-summary">
                  <div className="payment-total">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-amount">
                      {enrollmentForm.paymentOption === 'demo' ? '₹1.00' : enrollmentCourse.price}
                    </span>
                  </div>
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
                    <span className="razorpay-text">
                      Pay {enrollmentForm.paymentOption === 'demo' ? '₹1.00' : enrollmentCourse.price} - Go to RazorPay
                    </span>
                  </button>
                </div>

                <div className="demo-note">
                  <p>💡 <strong>Note:</strong> You will be redirected to RazorPay for secure payment processing.</p>
                  <p>🔒 <strong>Approval Required:</strong> Course access requires admin approval after payment.</p>
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
  const renderProgressTracking = () => {
    const accessibleCourses = availableCourses.filter(course => isCourseAccessible(course._id));
    
    return (
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
                <span className="number">{accessibleCourses.length}</span>
                <span className="label">Approved Courses</span>
              </div>
              <div className="stat">
                <span className="number">{completedCourses}</span>
                <span className="label">Completed</span>
              </div>
              <div className="stat">
                <span className="number">{accessibleCourses.length - completedCourses}</span>
                <span className="label">In Progress</span>
              </div>
            </div>
          </div>
        </div>

        {accessibleCourses.length > 0 && (
          <div className="detailed-progress">
            <h3>Course-wise Progress</h3>
            {accessibleCourses.map(course => (
              <div key={course._id} className="course-progress-item">
                <div className="course-info">
                  <h4>{course.title}</h4>
                  <p>Status: Approved</p>
                </div>
                <div className="progress-display">
                  <ProgressBar progress={calculateCourseCompletion(course._id)} />
                  <span className="status">
                    {calculateCourseCompletion(course._id) === 0 ? 'Not Started' : 
                     calculateCourseCompletion(course._id) === 100 ? 'Completed' : 
                     'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Student Review Section with Enhanced Storage
  const renderStudentReview = () => {
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
                      {availableCourses.filter(course => isCourseAccessible(course._id)).map(course => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {availableCourses.filter(course => isCourseAccessible(course._id)).length === 0 && (
                    <p className="form-hint">You need to have approved courses first to submit a review.</p>
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
                        />
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

  // Settings Section
  const renderSettings = () => (
    <div className="settings-content">
      <div className="section-header">
        <h2>Settings</h2>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
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

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">⚙️</div>
            <h3>Account Management</h3>
          </div>
          
          <div className="settings-card-content">
            <div className="account-actions">
              <button className="btn-secondary" onClick={handleExportData}>
                Export My Data
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

  // UPDATED: Course Content Section with enhanced note loading
  const renderCourseContent = () => {
    if (!selectedCourse || !isCourseAccessible(selectedCourse._id)) {
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
              <h1>Course Not Accessible</h1>
            </div>
          </div>
          <div className="access-denied">
            <div className="access-denied-icon">🔒</div>
            <h2>Course Access Required</h2>
            <p>This course is not yet approved for access. Please wait for admin approval or contact support.</p>
            <button 
              onClick={() => setActiveSection('available-courses')}
              className="btn-primary"
            >
              Browse Other Courses
            </button>
          </div>
        </div>
      );
    }

    const completionPercentage = calculateCourseCompletion(selectedCourse._id);
    const isCompleted = isCourseCompleted(selectedCourse._id);

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
          
          <button 
            className="btn-secondary refresh-btn"
            onClick={() => {
              console.log("🔄 Manually refreshing course content...");
              fetchCourseContent(selectedCourse._id);
              checkForAdminNotes();
            }}
            title="Refresh content to see latest notes"
          >
            🔄 Refresh Content
          </button>
        </div>

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

        <div className="content-tabs">
          <div className="tab-nav">
            <button className="tab-btn active">Videos</button>
            <button className="tab-btn">Notes</button>
            <button className="tab-btn">Quizzes</button>
          </div>

          <div className="tab-content">
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

            <div className="content-section">
              <div className="section-header-with-action">
                <h2>Notes & Study Materials</h2>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    console.log("🔄 Refreshing notes...");
                    fetchCourseContent(selectedCourse._id);
                    checkForAdminNotes();
                  }}
                >
                  🔄 Refresh Notes
                </button>
              </div>
              
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
                          <p>{note.description}</p>
                          <div className="note-meta">
                            <span>{note.fileType?.toUpperCase() || 'PDF'} • {note.pages || 'N/A'} pages</span>
                            {note.uploadedAt && (
                              <span className="upload-date">
                                Added: {new Date(note.uploadedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="note-actions">
                          <button 
                            onClick={() => handleViewNote(note)}
                            className="btn-secondary"
                          >
                            View
                          </button>
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
                  <h3>No Notes Available Yet</h3>
                  <p>Notes and study materials haven't been added to this course yet.</p>
                  <div className="empty-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        console.log("🔄 Refreshing course content...");
                        fetchCourseContent(selectedCourse.courseId || selectedCourse.id || selectedCourse._id);
                        checkForAdminNotes();
                      }}
                    >
                      Check for New Notes
                    </button>
                    <p className="empty-hint">
                      💡 <strong>Note:</strong> The course instructor needs to upload notes through the admin dashboard.
                      They will appear here automatically once uploaded.
                    </p>
                  </div>
                </div>
              )}
            </div>

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
      <button 
        className={`navbar-toggle ${isNavbarOpen ? 'open' : ''}`}
        onClick={toggleNavbar}
      >
        <span className="toggle-line"></span>
        <span className="toggle-line"></span>
        <span className="toggle-line"></span>
      </button>

      {isMobile && isNavbarOpen && (
        <div className="sidebar-overlay active" onClick={closeSidebar}></div>
      )}

      <div className={`dashboard-sidebar ${isNavbarOpen ? 'open' : 'closed'} ${!isNavbarOpen && !isMobile ? 'mini' : ''}`}>
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
            onClick={() => {
              setActiveSection('dashboard');
              closeSidebar();
            }}
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'my-courses' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('my-courses');
              closeSidebar();
            }}
          >
            <span className="icon">📚</span>
            <span>My Courses</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'available-courses' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('available-courses');
              closeSidebar();
            }}
          >
            <span className="icon">🎯</span>
            <span>Available Courses</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'certificates' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('certificates');
              closeSidebar();
            }}
          >
            <span className="icon">🏆</span>
            <span>Certificates</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('progress');
              closeSidebar();
            }}
          >
            <span className="icon">📈</span>
            <span>Progress Tracking</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'student-review' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('student-review');
              closeSidebar();
            }}
          >
            <span className="icon">💬</span>
            <span>Student Review</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'payment-details' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('payment-details');
              closeSidebar();
            }}
          >
            <span className="icon">💳</span>
            <span>Payment Details</span>
          </button>
          <button 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('settings');
              closeSidebar();
            }}
          >
            <span className="icon">⚙️</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout">
            <span className="icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className={`dashboard-main ${!isNavbarOpen ? 'expanded' : ''}`}>
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

      {renderCertificateModal()}

      {renderPaymentModal()}

      {renderNoteModal()}
    </div>
  );
}