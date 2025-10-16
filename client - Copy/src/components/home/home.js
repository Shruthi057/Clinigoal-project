import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [testimonials, setTestimonials] = useState([]); // Changed from static array to state
  
  // Initialize navigate for routing
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    
    // Fetch testimonials from API or localStorage
    const fetchTestimonials = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch('https://clinigoal-server.onrender.com/api/reviews');
        if (response.ok) {
          const reviewsData = await response.json();
          
          // Transform the review data to match the testimonial structure
          const formattedTestimonials = reviewsData.map(review => ({
            id: review._id,
            name: review.userName,
            role: "Student", // Default role since it's not in the review data
            text: review.reviewText,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=random`, // Generate avatar based on name
            rating: review.rating
          }));
          
          setTestimonials(formattedTestimonials);
        } else {
          // If API fails, use fallback testimonials
          setTestimonials([
            {
              id: 1,
              name: "Dr. Sarah Johnson",
              role: "Clinical Research Coordinator",
              text: "Clinigoal's courses transformed my career. The content was comprehensive and directly applicable to my work.",
              avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
              rating: 5
            },
            {
              id: 2,
              name: "Michael Chen",
              role: "Bioinformatics Specialist",
              text: "The instructors are industry experts who provide practical insights you won't find in textbooks.",
              avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
              rating: 5
            },
            {
              id: 3,
              name: "Priya Sharma",
              role: "Medical Coder",
              text: "I landed my dream job just two months after completing the Medical Coding program. Highly recommended!",
              avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
              rating: 5
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        
        // If there's an error, use fallback testimonials
        setTestimonials([
          {
            id: 1,
            name: "Dr. Sarah Johnson",
            role: "Clinical Research Coordinator",
            text: "Clinigoal's courses transformed my career. The content was comprehensive and directly applicable to my work.",
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            rating: 5
          },
          {
            id: 2,
            name: "Michael Chen",
            role: "Bioinformatics Specialist",
            text: "The instructors are industry experts who provide practical insights you won't find in textbooks.",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            rating: 5
          },
          {
            id: 3,
            name: "Priya Sharma",
            role: "Medical Coder",
            text: "I landed my dream job just two months after completing the Medical Coding program. Highly recommended!",
            avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
            rating: 5
          }
        ]);
      }
    };
    
    fetchTestimonials();
  }, []); // Empty dependency array means this runs once on component mount

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  // Navigation handlers
  const handleExploreCourses = () => {
    navigate('/courses');
  };

  const handleWatchDemo = () => {
    navigate('/demo');
  };

  const handleEnrollNow = (courseId) => {
    navigate(`/enroll/${courseId}`);
  };

  const handleLearnMore = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const handleStartLearning = () => {
    navigate('/courses');
  };

  const handleScheduleConsultation = () => {
    navigate('/consultation');
  };

  const courses = [
    {
      id: 1,
      title: "Clinical Research",
      description: "Comprehensive training in clinical trial design, management, and regulatory compliance.",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "6 Months",
      level: "Advanced",
      color: "#2563eb"
    },
    {
      id: 2,
      title: "Bioinformatics",
      description: "Master computational methods for analyzing biological data and genomic research.",
      image: "https://images.unsplash.com/photo-1532938408859-cec9ed5b7bc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "8 Months",
      level: "Intermediate",
      color: "#10b981"
    },
    {
      id: 3,
      title: "Medical Coding",
      description: "Learn accurate medical coding for healthcare billing and insurance claims.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "4 Months",
      level: "Beginner",
      color: "#8b5cf6"
    },
    {
      id: 4,
      title: "Pharmacovigilance",
      description: "Specialized training in drug safety monitoring and adverse event reporting.",
      image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "5 Months",
      level: "Intermediate",
      color: "#f59e0b"
    }
  ];

  const features = [
    {
      icon: "🎓",
      title: "Expert Instructors",
      description: "Learn from industry professionals with 10+ years of practical experience",
      gradient: "from-blue-500 to-cyan-500",
      color: "#3b82f6"
    },
    {
      icon: "📜",
      title: "Certification",
      description: "Earn recognized certificates to advance your career prospects",
      gradient: "from-green-500 to-emerald-500",
      color: "#10b981"
    },
    {
      icon: "💻",
      title: "Flexible Learning",
      description: "Study at your own pace with our intuitive online platform",
      gradient: "from-purple-500 to-pink-500",
      color: "#8b5cf6"
    },
    {
      icon: "🤝",
      title: "Career Support",
      description: "Get personalized assistance with job placement and career growth",
      gradient: "from-orange-500 to-red-500",
      color: "#f59e0b"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students Trained", icon: "👨‍🎓" },
    { number: "95%", label: "Completion Rate", icon: "📈" },
    { number: "89%", label: "Job Placement", icon: "💼" },
    { number: "50+", label: "Industry Experts", icon: "👨‍🏫" }
  ];

  const registrationSteps = [
    {
      step: 1,
      title: "Login to Clinigoal",
      description: "Access your account or create a new one to get started",
      icon: "🔐",
      color: "#4f46e5"
    },
    {
      step: 2,
      title: "Sign Up - Enter Details",
      description: "Provide your personal and professional information",
      icon: "📝",
      color: "#0891b2"
    },
    {
      step: 3,
      title: "Generate OTP",
      description: "Verify your email and complete your profile",
      icon: "📱",
      color: "#0d9488"
    },
    {
      step: 4,
      title: "Access Courses",
      description: "Once complete, you can easily access all courses",
      icon: "🎓",
      color: "#7e22ce"
    }
  ];

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
                <button className="btn-secondary hero-btn" onClick={handleWatchDemo}>
                  <span>Watch Demo</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                  <div className="btn-glow"></div>
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
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Healthcare Education" className="hero-main-image" />
                  <div className="image-shine"></div>
                </div>
                <div className="floating-card card-1">
                  <div className="card-icon">📊</div>
                  <div className="card-text">
                    <div className="card-title">Hands-on Learning</div>
                    <div className="card-subtitle">Real projects</div>
                  </div>
                  <div className="card-glow"></div>
                </div>
                <div className="floating-card card-2">
                  <div className="card-icon">👥</div>
                  <div className="card-text">
                    <div className="card-title">Expert Mentors</div>
                    <div className="card-subtitle">1:1 Guidance</div>
                  </div>
                  <div className="card-glow"></div>
                </div>
                <div className="floating-card card-3">
                  <div className="card-icon">🏆</div>
                  <div className="card-text">
                    <div className="card-title">Certification</div>
                    <div className="card-subtitle">Global Recognition</div>
                  </div>
                  <div className="card-glow"></div>
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
            <h2 className="section-title"></h2>
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
            <h2 className="section-title"></h2>
            <p className="section-description">
              Specialized programs designed for healthcare professionals seeking career advancement
            </p>
          </div>
          <div className="courses-grid">
            {courses.map((course, index) => (
              <div 
                key={course.id} 
                className={`course-card ${hoveredCourse === course.id ? 'hovered' : ''}`}
                style={{animationDelay: `${index * 0.15}s`}}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
              >
                <div className="course-badge" style={{backgroundColor: course.color}}>
                  {course.level}
                </div>
                <div className="course-image">
                  <img src={course.image} alt={course.title} />
                  <div className="course-overlay">
                    <button className="btn-view" onClick={() => handleLearnMore(course.id)}>
                      <span>View Details</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                  <div className="course-shine"></div>
                </div>
                <div className="course-content">
                  <div className="course-meta">
                    <span className="duration">⏱️ {course.duration}</span>
                    <span className="level">{course.level}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-actions">
                    <button className="btn-primary course-btn" onClick={() => handleEnrollNow(course.id)}>
                      Enroll Now
                      <div className="btn-particles">
                        <span>✨</span>
                        <span>⭐</span>
                      </div>
                    </button>
                    <button className="btn-outline" onClick={() => handleLearnMore(course.id)}>
                      Learn More
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

      {/* Why Choose Clinigoal - Updated to 4 cards per row with equal height */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Why Choose Us</span>
            <h2 className="section-title"></h2>
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
                  border: `1px solid ${feature.color}30`,
                  height: '320px', // Fixed height for all cards
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
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
                <div style={{flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <h3 style={{ color: '#f8fafc', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ color: '#e2e8f0', lineHeight: '1.5' }}>{feature.description}</p>
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
            <h2 className="section-title"></h2>
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
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                    <div className="avatar-glow"></div>
                  </div>
                  <div>
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
                <div className="btn-sparkle">🚀</div>
              </button>
              <button className="btn-outline-white" onClick={handleScheduleConsultation}>
                Schedule a Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h2>Stay Updated with New Courses</h2>
              <p>Subscribe to our newsletter for the latest updates, offers, and industry insights</p>
            </div>
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary newsletter-btn">
                  <span>Subscribe</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="btn-glow"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;