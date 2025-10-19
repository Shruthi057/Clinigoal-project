import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Enrollment form state
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentCourse, setEnrollmentCourse] = useState(null);
  const [enrollmentForm, setEnrollmentForm] = useState({
    courseId: '',
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    paymentMethod: 'razorpay',
    paymentOption: 'demo',
    agreeToTerms: false
  });
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    fetchAllData();
    
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchTestimonials(),
        fetchCourses()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch testimonials from localStorage
  const fetchTestimonials = () => {
    try {
      const allReviews = JSON.parse(localStorage.getItem('allStudentReviews') || '[]');
      const userEmails = JSON.parse(localStorage.getItem('userEmails') || '[]');
      let userReviews = [];
      
      userEmails.forEach(email => {
        const userKey = `userReviews_${email.replace(/[@.]/g, '_')}`;
        const reviews = JSON.parse(localStorage.getItem(userKey) || '[]');
        userReviews = [...userReviews, ...reviews];
      });

      const allUserReviews = [...allReviews, ...userReviews];
      const uniqueReviews = allUserReviews.filter((review, index, self) => 
        index === self.findIndex(r => r._id === review._id)
      );

      const formattedTestimonials = uniqueReviews
        .filter(review => review.reviewText && review.reviewText.trim().length > 0)
        .slice(0, 6)
        .map(review => ({
          id: review._id,
          name: review.userName || 'Anonymous',
          role: "Student",
          text: review.reviewText,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName || 'Student')}&background=random&size=100`,
          rating: review.rating || 5,
          course: review.courseTitle || 'Clinical Course'
        }));

      if (formattedTestimonials.length === 0) {
        setTestimonials(getFallbackTestimonials());
      } else {
        setTestimonials(formattedTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials(getFallbackTestimonials());
    }
  };

  // Fetch courses from admin dashboard storage
  const fetchCourses = () => {
    try {
      const savedCourses = localStorage.getItem('clinigoalCourses');
      if (savedCourses) {
        const parsedCourses = JSON.parse(savedCourses);
        
        const formattedCourses = parsedCourses.map(course => ({
          _id: course._id,
          title: course.title,
          description: course.description,
          image: course.image || getCourseImage(course.title),
          duration: course.duration || '6 Months',
          level: course.level || 'Intermediate',
          price: course.price || '₹15,999',
          originalPrice: course.originalPrice,
          instructor: course.instructor,
          features: course.features || [],
          color: getCourseColor(course.title),
          detailedDescription: course.detailedDescription || `Comprehensive course covering all aspects of ${course.title}. Perfect for healthcare professionals looking to advance their career.`,
          modules: course.modules || ['Introduction', 'Advanced Concepts', 'Practical Applications', 'Case Studies'],
          whatYouLearn: course.whatYouLearn || [
            'Industry best practices',
            'Practical skills development',
            'Real-world case studies',
            'Career advancement strategies'
          ]
        }));

        setCourses(formattedCourses.slice(0, 4));
      } else {
        setCourses(getFallbackCourses());
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(getFallbackCourses());
    }
  };

  // Helper function to get course image based on title
  const getCourseImage = (title) => {
    const courseImages = {
      'Clinical Research': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'Bioinformatics': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'Medical Coding': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'Pharmacovigilance': 'https://images.unsplash.com/photo-1585435557343-3b1b5fa4c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    };
    return courseImages[title] || 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  };

  // Helper function to get course color based on title
  const getCourseColor = (title) => {
    const courseColors = {
      'Clinical Research': '#2563eb',
      'Bioinformatics': '#10b981',
      'Medical Coding': '#8b5cf6',
      'Pharmacovigilance': '#f59e0b'
    };
    return courseColors[title] || '#2563eb';
  };

  const getFallbackTestimonials = () => [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Clinical Research Coordinator",
      text: "Clinigoal's courses transformed my career. The content was comprehensive and directly applicable to my work.",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
      rating: 5,
      course: "Clinical Research"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Bioinformatics Specialist",
      text: "The instructors are industry experts who provide practical insights you won't find in textbooks.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
      rating: 5,
      course: "Bioinformatics"
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Medical Coder",
      text: "The practical approach and real-world examples made complex concepts easy to understand.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
      rating: 5,
      course: "Medical Coding"
    }
  ];

  const getFallbackCourses = () => [
    {
      _id: 1,
      title: "Clinical Research",
      description: "Comprehensive training in clinical trial design, management, and regulatory compliance for healthcare professionals.",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "6 Months",
      level: "Advanced",
      price: "₹15,999",
      originalPrice: "₹19,999",
      instructor: "Dr. Sarah Wilson",
      color: "#2563eb",
      detailedDescription: "Master clinical research methodologies, regulatory requirements, and trial management. Perfect for healthcare professionals seeking career advancement in clinical research.",
      modules: ['Introduction to Clinical Research', 'Regulatory Framework', 'Trial Design & Management', 'Data Analysis & Reporting'],
      whatYouLearn: [
        'Clinical trial design and protocol development',
        'Regulatory compliance and ethical considerations',
        'Data management and statistical analysis',
        'Patient safety and pharmacovigilance'
      ],
      features: ['Industry-recognized certification', 'Placement assistance', 'Lifetime access']
    },
    {
      _id: 2,
      title: "Bioinformatics",
      description: "Master computational methods for analyzing biological data and genomic research with hands-on projects.",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "8 Months",
      level: "Intermediate",
      price: "₹18,999",
      originalPrice: "₹22,999",
      instructor: "Prof. Michael Chen",
      color: "#10b981",
      detailedDescription: "Learn bioinformatics tools and techniques for genomic data analysis, sequence alignment, and biological database management.",
      modules: ['Introduction to Bioinformatics', 'Sequence Analysis', 'Genomic Data Mining', 'Structural Bioinformatics'],
      whatYouLearn: [
        'Bioinformatics tools and databases',
        'Sequence alignment and analysis',
        'Genomic data interpretation',
        'Structural biology concepts'
      ],
      features: ['Real-world projects', 'Expert mentorship', 'Career guidance']
    },
    {
      _id: 3,
      title: "Medical Coding",
      description: "Learn accurate medical coding practices and healthcare documentation for insurance and billing purposes.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "5 Months",
      level: "Beginner",
      price: "₹12,999",
      originalPrice: "₹15,999",
      instructor: "Ms. Anjali Patel",
      color: "#8b5cf6",
      detailedDescription: "Comprehensive training in medical coding systems, healthcare documentation, and insurance billing procedures.",
      modules: ['Medical Terminology', 'CPT & ICD Coding', 'Healthcare Documentation', 'Billing Procedures'],
      whatYouLearn: [
        'Medical coding standards and guidelines',
        'Healthcare documentation practices',
        'Insurance billing procedures',
        'Compliance and regulatory requirements'
      ],
      features: ['Certification preparation', 'Practical assignments', 'Job support']
    },
    {
      _id: 4,
      title: "Pharmacovigilance",
      description: "Master drug safety monitoring and adverse event reporting in pharmaceutical industry settings.",
      image: "https://images.unsplash.com/photo-1585435557343-3b1b5fa4c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "7 Months",
      level: "Intermediate",
      price: "₹16,999",
      originalPrice: "₹20,999",
      instructor: "Dr. Robert Kim",
      color: "#f59e0b",
      detailedDescription: "Learn pharmacovigilance principles, drug safety monitoring, adverse event reporting, and regulatory requirements.",
      modules: ['Drug Safety Principles', 'Adverse Event Reporting', 'Risk Management', 'Regulatory Guidelines'],
      whatYouLearn: [
        'Drug safety monitoring techniques',
        'Adverse event reporting procedures',
        'Risk management strategies',
        'Regulatory compliance requirements'
      ],
      features: ['Industry case studies', 'Regulatory training', 'Career placement']
    }
  ];

  // Navigation handlers - UPDATED WITH REGISTER NAVIGATION
  const handleExploreCourses = () => {
    navigate('/courses');
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const handleStartLearning = () => {
    navigate('/courses');
  };

  // NEW: Handle Register button click
  const handleRegisterClick = () => {
    navigate('/register');
  };

  // UPDATED: Remove enrollment form functions since we're redirecting to register page
  const handleRegisterForCourse = (course) => {
    // Store the selected course in localStorage or context for the register page
    localStorage.setItem('selectedCourse', JSON.stringify(course));
    navigate('/register');
  };

  // Course details function - Navigate to full page
  const handleCourseDetailsClick = (course) => {
    console.log('Course details clicked:', course);
    // Navigate to full course details page
    navigate(`/courses/${course._id}`);
  };

  const features = [
    {
      icon: "🎓",
      title: "Expert Instructors",
      description: "Learn from industry professionals with 10+ years of practical experience in healthcare and life sciences",
      gradient: "from-blue-500 to-cyan-500",
      color: "#3b82f6"
    },
    {
      icon: "📜",
      title: "Industry Certification",
      description: "Earn recognized certificates that are valued by employers in healthcare and pharmaceutical industries",
      gradient: "from-green-500 to-emerald-500",
      color: "#10b981"
    },
    {
      icon: "💻",
      title: "Flexible Learning",
      description: "Study at your own pace with 24/7 access to course materials and lifetime content updates",
      gradient: "from-purple-500 to-pink-500",
      color: "#8b5cf6"
    },
    {
      icon: "🤝",
      title: "Career Support",
      description: "Get personalized career guidance, resume reviews, and job placement assistance",
      gradient: "from-orange-500 to-red-500",
      color: "#f59e0b"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students Trained", icon: "👨‍🎓" },
    { number: "95%", label: "Completion Rate", icon: "📈" },
    { number: "89%", label: "Job Placement", icon: "💼" },
    { number: "50+", label: "Industry Partners", icon: "🤝" }
  ];

  const registrationSteps = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up with your email and create your Clinigoal student profile",
      icon: "🔐",
      color: "#4f46e5"
    },
    {
      step: 2,
      title: "Browse Courses",
      description: "Explore our specialized courses in clinical research and healthcare sciences",
      icon: "📚",
      color: "#0891b2"
    },
    {
      step: 3,
      title: "Register & Pay",
      description: "Select your course and complete the secure payment process",
      icon: "💳",
      color: "#0d9488"
    },
    {
      step: 4,
      title: "Start Learning",
      description: "Access course materials and begin your learning journey immediately",
      icon: "🎓",
      color: "#7e22ce"
    }
  ];

  if (loading) {
    return (
      <div className="home loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Clinigoal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`home ${isVisible ? 'page-visible' : ''}`}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}></div>
            ))}
          </div>
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span className="badge-text">🎓 Trusted by Healthcare Professionals</span>
                <div className="badge-glow"></div>
              </div>
              <h1 className="hero-title">
                Advance Your Career in <span className="highlight">Healthcare Sciences</span>
              </h1>
              <p className="hero-description">
                Specialized courses in Clinical Research, Bioinformatics, Medical Coding, and Pharmacovigilance taught by industry experts with decades of experience.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary hero-btn" onClick={handleExploreCourses}>
                  <span>Explore Courses</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="btn-sparkle">✨</div>
                </button>
                <button className="btn-secondary hero-btn" onClick={handleRegisterClick}>
                  <span>Register Now</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item" style={{animationDelay: `${index * 0.2}s`}}>
                    <div className="stat-content">
                      <div className="stat-icon">{stat.icon}</div>
                      <div className="stat-info">
                        <div className="stat-number">{stat.number}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    </div>
                    <div className="stat-glow"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-image">
              <div className="image-container">
                <div className="image-wrapper">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                    alt="Healthcare Education" 
                    className="hero-main-image" 
                  />
                  <div className="image-shine"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Steps Section */}
      <section className="registration-steps">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Get Started</span>
            <h2 className="section-title">Simple Registration Process</h2>
            <p className="section-description">
              Join Clinigoal in just 4 simple steps and start your learning journey
            </p>
          </div>
          
          <div className="steps-container">
            <div className="steps-progress">
              <div className="progress-line"></div>
              {registrationSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className={`step-point ${activeStep >= index ? 'active' : ''}`}
                  style={{ left: `${(index / (registrationSteps.length - 1)) * 100}%` }}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="step-number">{step.step}</div>
                  <div className="step-icon" style={{ backgroundColor: step.color }}>
                    {step.icon}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="steps-content">
              {registrationSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className={`step-card ${activeStep === index ? 'active' : ''}`}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <div className="step-card-header">
                    <div className="step-card-icon" style={{ backgroundColor: step.color }}>
                      {step.icon}
                    </div>
                    <div className="step-card-number">Step {step.step}</div>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className="step-card-shine"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="steps-navigation">
            <button 
              className="step-nav-btn prev" 
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>
            <button 
              className="step-nav-btn next"
              disabled={activeStep === registrationSteps.length - 1}
              onClick={() => setActiveStep(prev => Math.min(registrationSteps.length - 1, prev + 1))}
            >
              Next
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="stat-card-content">
                  <div className="stat-card-icon">{stat.icon}</div>
                  <div className="stat-card-info">
                    <div className="stat-card-number">{stat.number}</div>
                    <div className="stat-card-label">{stat.label}</div>
                  </div>
                </div>
                <div className="stat-card-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="courses">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Our Programs</span>
            <h2 className="section-title">Featured Courses</h2>
            <p className="section-description">
              Specialized programs designed for healthcare professionals seeking career advancement
            </p>
          </div>
          <div className="courses-grid">
            {courses.map((course, index) => (
              <div 
                key={course._id} 
                className={`course-card ${hoveredCourse === course._id ? 'hovered' : ''}`}
                style={{animationDelay: `${index * 0.15}s`}}
                onMouseEnter={() => setHoveredCourse(course._id)}
                onMouseLeave={() => setHoveredCourse(null)}
              >
                <div className="course-badge" style={{backgroundColor: course.color}}>
                  {course.level}
                </div>
                <div className="course-image">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="course-overlay"></div>
                  <div className="course-shine"></div>
                </div>
                <div className="course-content">
                  <div className="course-meta">
                    <span className="duration">⏱️ {course.duration}</span>
                    <span className="instructor">👨‍🏫 {course.instructor}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-price">
                    <span className="price">{course.price}</span>
                    {course.originalPrice && (
                      <span className="original-price">{course.originalPrice}</span>
                    )}
                  </div>
                  <div className="course-actions">
                    {/* UPDATED: Changed from Enroll Now to Register */}
                    <button className="btn-primary course-btn" onClick={() => handleRegisterForCourse(course)}>
                      Register Now
                      <div className="btn-particles">
                        <span></span>
                        <span></span>
                      </div>
                    </button>
                    <button className="btn-outline" onClick={() => handleCourseDetailsClick(course)}>
                      Course Details
                    </button>
                  </div>
                </div>
                <div className="course-glow" style={{background: `radial-gradient(circle at center, ${course.color}20, transparent 70%)`}}></div>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <button className="btn-secondary" onClick={handleViewAllCourses}>
              View All Courses
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Clinigoal */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Why Choose Us</span>
            <h2 className="section-title">Why Choose Clinigoal</h2>
            <p className="section-description">
              We provide the best learning experience for healthcare professionals with industry-focused curriculum
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${hoveredFeature === index ? 'hovered' : ''}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  background: `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)`,
                  border: `1px solid ${feature.color}30`
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-icon-wrapper" style={{ 
                  background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                  border: `1px solid ${feature.color}30`
                }}>
                  <div className="feature-icon" style={{ 
                    background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                  }}>
                    {feature.icon}
                  </div>
                  <div className="feature-glow" style={{ 
                    background: `radial-gradient(circle at center, ${feature.color}40, transparent 70%)`
                  }}></div>
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <div className="feature-shine"></div>
                <div className="feature-card-glow" style={{
                  background: `radial-gradient(circle at center, ${feature.color}20, transparent 70%)`
                }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Testimonials</span>
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-description">
              Hear from professionals who transformed their careers with Clinigoal
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="testimonial-card" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="testimonial-content">
                  <div className="quote-icon">❝</div>
                  <p>"{testimonial.text}"</p>
                  <div className="rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="star">⭐</span>
                    ))}
                  </div>
                  <div className="course-tag">{testimonial.course}</div>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                    <div className="avatar-glow"></div>
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <div className="testimonial-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-particles">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="cta-particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}></div>
            ))}
          </div>
        </div>
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Career?</h2>
            <p>Join thousands of healthcare professionals who have advanced their careers with Clinigoal</p>
            <div className="cta-buttons">
              <button className="btn-primary cta-btn" onClick={handleStartLearning}>
                Start Learning Today
                <div className="btn-sparkle"></div>
              </button>
              <button className="btn-secondary cta-btn" onClick={handleRegisterClick}>
                Register Now
                <div className="btn-sparkle"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Industry Info Section */}
      <section className="industry-info">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Industry Insights</span>
            <h2 className="section-title">Why Healthcare Sciences?</h2>
            <p className="section-description">
              The healthcare and life sciences industry is rapidly evolving with tremendous growth opportunities
            </p>
          </div>
          
          <div className="industry-stats">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-number">18%</div>
              <div className="stat-label">Projected Growth in Clinical Research</div>
              <div className="stat-description">By 2026, creating 50,000+ new jobs in India</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-number">₹6-12 LPA</div>
              <div className="stat-label">Average Starting Salary</div>
              <div className="stat-description">For trained professionals in healthcare sciences</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🏥</div>
              <div className="stat-number">1000+</div>
              <div className="stat-label">New Healthcare Companies</div>
              <div className="stat-description">Established in India in the last 3 years</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🌍</div>
              <div className="stat-number">Global</div>
              <div className="stat-label">Career Opportunities</div>
              <div className="stat-description">Work with international pharmaceutical companies</div>
            </div>
          </div>

          <div className="industry-features">
            <div className="feature-column">
              <h3>📊 High-Demand Skills</h3>
              <ul>
                <li>Clinical Trial Management</li>
                <li>Regulatory Affairs</li>
                <li>Medical Coding & Billing</li>
                <li>Drug Safety Monitoring</li>
                <li>Bioinformatics Analysis</li>
              </ul>
            </div>
            
            <div className="feature-column">
              <h3>🎯 Career Paths</h3>
              <ul>
                <li>Clinical Research Coordinator</li>
                <li>Medical Coder</li>
                <li>Pharmacovigilance Officer</li>
                <li>Bioinformatics Specialist</li>
                <li>Regulatory Affairs Manager</li>
              </ul>
            </div>
            
            <div className="feature-column">
              <h3>💼 Top Recruiters</h3>
              <ul>
                <li>Pharmaceutical Companies</li>
                <li>Research Organizations</li>
                <li>Hospitals & Healthcare</li>
                <li>IT Healthcare Firms</li>
                <li>Medical Device Companies</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;