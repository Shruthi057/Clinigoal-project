import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = () => {
    try {
      // Fetch from admin-created courses first
      const savedCourses = localStorage.getItem('clinigoalCourses');
      let foundCourse = null;

      if (savedCourses) {
        const courses = JSON.parse(savedCourses);
        foundCourse = courses.find(c => c._id === id || c._id === parseInt(id));
      }

      // If not found in admin courses, use fallback
      if (!foundCourse) {
        foundCourse = getFallbackCourses().find(c => c._id === id || c._id === parseInt(id));
      }

      if (foundCourse) {
        // Enhance course data with realistic details
        const enhancedCourse = {
          ...foundCourse,
          image: foundCourse.image || getCourseImage(foundCourse.title),
          color: foundCourse.color || getCourseColor(foundCourse.title),
          duration: foundCourse.duration || getCourseDuration(foundCourse.title),
          level: foundCourse.level || getCourseLevel(foundCourse.title),
          price: foundCourse.price || getCoursePrice(foundCourse.title),
          originalPrice: foundCourse.originalPrice || getOriginalPrice(foundCourse.title),
          instructor: foundCourse.instructor || getCourseInstructor(foundCourse.title),
          features: foundCourse.features || getCourseFeatures(foundCourse.title),
          modules: foundCourse.modules || getCourseModules(foundCourse.title),
          whatYouLearn: foundCourse.whatYouLearn || getWhatYouLearn(foundCourse.title),
          detailedDescription: foundCourse.detailedDescription || getDetailedDescription(foundCourse.title),
          enrollmentCount: foundCourse.enrollmentCount || Math.floor(Math.random() * 500) + 100,
          rating: foundCourse.rating || (Math.random() * 1 + 4).toFixed(1),
          reviews: foundCourse.reviews || Math.floor(Math.random() * 200) + 50
        };
        
        setCourse(enhancedCourse);
        fetchRelatedCourses(enhancedCourse.title);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedCourses = (currentCourseTitle) => {
    try {
      const savedCourses = localStorage.getItem('clinigoalCourses');
      let allCourses = [];

      if (savedCourses) {
        allCourses = JSON.parse(savedCourses);
      } else {
        allCourses = getFallbackCourses();
      }

      // Filter related courses (excluding current course)
      const related = allCourses
        .filter(c => c.title !== currentCourseTitle)
        .slice(0, 3)
        .map(course => ({
          ...course,
          image: course.image || getCourseImage(course.title),
          color: course.color || getCourseColor(course.title)
        }));

      setRelatedCourses(related);
    } catch (error) {
      console.error('Error fetching related courses:', error);
    }
  };

  // Helper functions for realistic course data
  const getCourseImage = (title) => {
    const courseImages = {
      'Clinical Research': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Bioinformatics': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Medical Coding': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Pharmacovigilance': 'https://images.unsplash.com/photo-1585435557343-3b1b5fa4c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Clinical Data Management': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Healthcare Analytics': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    return courseImages[title] || 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  const getCourseColor = (title) => {
    const courseColors = {
      'Clinical Research': '#2563eb',
      'Bioinformatics': '#10b981', 
      'Medical Coding': '#8b5cf6',
      'Pharmacovigilance': '#f59e0b',
      'Clinical Data Management': '#ec4899',
      'Healthcare Analytics': '#06b6d4'
    };
    return courseColors[title] || '#2563eb';
  };

  const getCourseDuration = (title) => {
    const durations = {
      'Clinical Research': '6 Months',
      'Bioinformatics': '8 Months',
      'Medical Coding': '5 Months', 
      'Pharmacovigilance': '7 Months',
      'Clinical Data Management': '6 Months',
      'Healthcare Analytics': '4 Months'
    };
    return durations[title] || '6 Months';
  };

  const getCourseLevel = (title) => {
    const levels = {
      'Clinical Research': 'Advanced',
      'Bioinformatics': 'Intermediate',
      'Medical Coding': 'Beginner',
      'Pharmacovigilance': 'Intermediate',
      'Clinical Data Management': 'Intermediate', 
      'Healthcare Analytics': 'Advanced'
    };
    return levels[title] || 'Intermediate';
  };

  const getCoursePrice = (title) => {
    const prices = {
      'Clinical Research': '₹15,999',
      'Bioinformatics': '₹18,999',
      'Medical Coding': '₹12,999',
      'Pharmacovigilance': '₹16,999',
      'Clinical Data Management': '₹14,999',
      'Healthcare Analytics': '₹17,999'
    };
    return prices[title] || '₹15,999';
  };

  const getOriginalPrice = (title) => {
    const originalPrices = {
      'Clinical Research': '₹19,999',
      'Bioinformatics': '₹22,999', 
      'Medical Coding': '₹15,999',
      'Pharmacovigilance': '₹20,999',
      'Clinical Data Management': '₹18,999',
      'Healthcare Analytics': '₹21,999'
    };
    return originalPrices[title] || '₹19,999';
  };

  const getCourseInstructor = (title) => {
    const instructors = {
      'Clinical Research': 'Dr. Sarah Wilson',
      'Bioinformatics': 'Prof. Michael Chen',
      'Medical Coding': 'Ms. Anjali Patel',
      'Pharmacovigilance': 'Dr. Robert Kim',
      'Clinical Data Management': 'Dr. Priya Sharma',
      'Healthcare Analytics': 'Prof. David Brown'
    };
    return instructors[title] || 'Industry Expert';
  };

  const getCourseFeatures = (title) => {
    const baseFeatures = ['Industry-recognized certification', 'Placement assistance', 'Lifetime access'];
    
    const additionalFeatures = {
      'Clinical Research': ['Real clinical trial projects', 'Regulatory training', 'Case studies'],
      'Bioinformatics': ['Genomic data projects', 'Tool proficiency', 'Research mentorship'],
      'Medical Coding': ['CPT/ICD training', 'Billing simulations', 'Certification prep'],
      'Pharmacovigilance': ['Drug safety cases', 'Regulatory compliance', 'Industry reports'],
      'Clinical Data Management': ['EDC system training', 'Data quality projects', 'CDISC standards'],
      'Healthcare Analytics': ['Data visualization', 'Statistical analysis', 'Predictive modeling']
    };

    return [...baseFeatures, ...(additionalFeatures[title] || [])];
  };

  const getCourseModules = (title) => {
    const modules = {
      'Clinical Research': [
        'Introduction to Clinical Research',
        'Regulatory Framework & Ethics',
        'Clinical Trial Design & Protocol Development',
        'Patient Recruitment & Retention',
        'Data Management & Quality Control',
        'Safety Reporting & Pharmacovigilance',
        'Clinical Trial Monitoring & Auditing',
        'Data Analysis & Statistical Methods',
        'Clinical Study Reports & Documentation',
        'Career Development in Clinical Research'
      ],
      'Bioinformatics': [
        'Introduction to Bioinformatics',
        'Biological Databases & Resources',
        'Sequence Alignment & Analysis',
        'Genomic Data Mining & Interpretation',
        'Structural Bioinformatics',
        'Phylogenetic Analysis',
        'Transcriptomics & Proteomics',
        'Drug Discovery & Design',
        'Bioinformatics Programming (Python/R)',
        'Research Project & Applications'
      ],
      'Medical Coding': [
        'Medical Terminology & Anatomy',
        'Healthcare Delivery Systems',
        'CPT Coding System',
        'ICD-10-CM Coding',
        'HCPCS Level II Coding',
        'Medical Billing Procedures',
        'Insurance Claim Processing',
        'Compliance & Regulatory Requirements',
        'Electronic Health Records (EHR)',
        'Certification Preparation & Practice'
      ]
    };
    
    return modules[title] || [
      'Module 1: Fundamentals',
      'Module 2: Core Concepts',
      'Module 3: Advanced Topics',
      'Module 4: Practical Applications',
      'Module 5: Industry Projects'
    ];
  };

  const getWhatYouLearn = (title) => {
    const learnings = {
      'Clinical Research': [
        'Clinical trial design and protocol development',
        'Regulatory compliance and ethical considerations',
        'Patient safety monitoring and pharmacovigilance',
        'Data management and statistical analysis',
        'Clinical study documentation and reporting',
        'Quality assurance and auditing procedures'
      ],
      'Bioinformatics': [
        'Bioinformatics tools and database management',
        'Sequence alignment and genomic analysis',
        'Statistical methods for biological data',
        'Programming for bioinformatics (Python/R)',
        'Drug discovery and development processes',
        'Research paper analysis and interpretation'
      ],
      'Medical Coding': [
        'Accurate medical coding using CPT, ICD-10, HCPCS',
        'Healthcare documentation and terminology',
        'Insurance billing and claim processing',
        'Compliance with healthcare regulations',
        'Electronic health record systems',
        'Revenue cycle management'
      ]
    };
    
    return learnings[title] || [
      'Industry best practices and standards',
      'Practical skills development',
      'Real-world case studies and applications',
      'Career advancement strategies',
      'Professional certification preparation'
    ];
  };

  const getDetailedDescription = (title) => {
    const descriptions = {
      'Clinical Research': `This comprehensive Clinical Research course provides in-depth training in clinical trial design, management, and regulatory compliance. You'll learn from industry experts with decades of experience in pharmaceutical and healthcare research. The course covers everything from protocol development to final study reporting, preparing you for roles in clinical research organizations, pharmaceutical companies, and regulatory agencies. Gain hands-on experience with real clinical trial scenarios and learn the latest industry standards and best practices.`,

      'Bioinformatics': `Master computational methods for analyzing biological data in this intensive Bioinformatics course. Learn to work with genomic sequences, protein structures, and biological databases using cutting-edge tools and programming languages. Our curriculum is designed by leading bioinformatics experts and includes practical projects that mirror real-world research scenarios. Perfect for biologists, computer scientists, and healthcare professionals looking to enter the rapidly growing field of computational biology.`,

      'Medical Coding': `Become a certified medical coder with our comprehensive training program that covers all major coding systems including CPT, ICD-10-CM, and HCPCS Level II. Learn accurate coding for healthcare billing, insurance claims, and medical documentation. Our hands-on approach includes real case studies and practice with electronic health record systems. This course prepares you for industry-recognized certifications and high-demand roles in healthcare administration.`
    };
    
    return descriptions[title] || `This comprehensive course provides specialized training in ${title}, designed by industry experts to help you advance your career in healthcare sciences. You'll gain practical skills, industry knowledge, and professional certification that employers value.`;
  };

  const getFallbackCourses = () => [
    {
      _id: 1,
      title: "Clinical Research",
      description: "Comprehensive training in clinical trial design, management, and regulatory compliance.",
      price: "₹15,999",
      originalPrice: "₹19,999"
    },
    {
      _id: 2, 
      title: "Bioinformatics",
      description: "Master computational methods for analyzing biological data and genomic research.",
      price: "₹18,999",
      originalPrice: "₹22,999"
    },
    {
      _id: 3,
      title: "Medical Coding", 
      description: "Learn accurate medical coding for healthcare billing and insurance claims.",
      price: "₹12,999",
      originalPrice: "₹15,999"
    },
    {
      _id: 4,
      title: "Pharmacovigilance",
      description: "Specialized training in drug safety monitoring and adverse event reporting.",
      price: "₹16,999", 
      originalPrice: "₹20,999"
    }
  ];

  const handleEnrollment = () => {
    // Save enrollment intent to localStorage
    const enrollmentData = {
      courseId: course._id,
      courseTitle: course.title,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    const enrollments = JSON.parse(localStorage.getItem('courseEnrollments') || '[]');
    localStorage.setItem('courseEnrollments', JSON.stringify([...enrollments, enrollmentData]));
    
    setEnrollmentSuccess(true);
    setTimeout(() => {
      window.location.href = `/enroll/${course._id}`;
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading Course Details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f8fafc',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ color: '#1e293b', marginBottom: '10px' }}>Course Not Found</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>
            The course you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            to="/courses" 
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Success Message */}
      {enrollmentSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          animation: 'slideInRight 0.3s ease'
        }}>
          ✅ Redirecting to enrollment page...
        </div>
      )}

      {/* Course Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${course.color}20 0%, transparent 100%)`,
        padding: '80px 20px 60px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '60px',
            alignItems: 'start'
          }}>
            {/* Course Content */}
            <div>
              <nav style={{ marginBottom: '20px' }}>
                <Link 
                  to="/courses" 
                  style={{
                    color: '#64748b',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  ← Back to Courses
                </Link>
              </nav>
              
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                marginBottom: '30px'
              }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 12px',
                    background: course.color,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {course.level}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    ⏱️ {course.duration}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    👥 {course.enrollmentCount}+ enrolled
                  </span>
                </div>

                <h1 style={{
                  fontSize: '2.5rem',
                  color: '#1e293b',
                  marginBottom: '15px',
                  lineHeight: '1.2'
                }}>
                  {course.title}
                </h1>
                
                <p style={{
                  fontSize: '1.2rem',
                  color: '#64748b',
                  lineHeight: '1.6',
                  marginBottom: '25px'
                }}>
                  {course.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{ color: '#f59e0b', fontSize: '18px' }}>⭐</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{course.rating}</span>
                    <span style={{ color: '#64748b' }}>({course.reviews} reviews)</span>
                  </div>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#64748b' }}>👨‍🏫 {course.instructor}</span>
                </div>

                <div style={{
                  padding: '20px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>What You'll Learn</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '10px'
                  }}>
                    {course.whatYouLearn.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 0'
                      }}>
                        <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                        <span style={{ color: '#475569' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div style={{
              position: 'sticky',
              top: '100px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              padding: '30px',
              border: `2px solid ${course.color}20`
            }}>
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '20px'
              }}>
                <img 
                  src={course.image} 
                  alt={course.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {course.price}
                  </span>
                  {course.originalPrice && (
                    <span style={{
                      fontSize: '1rem',
                      color: '#64748b',
                      textDecoration: 'line-through'
                    }}>
                      {course.originalPrice}
                    </span>
                  )}
                </div>
                <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
                  💰 Limited time offer
                </p>
              </div>

              <button
                onClick={handleEnrollment}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: course.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '15px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = course.color;
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = course.color;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Enroll Now
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  ✅ {course.enrollmentCount}+ students enrolled
                </p>
              </div>

              <div style={{
                padding: '15px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ marginBottom: '10px', color: '#1e293b' }}>This course includes:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {course.features.map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#475569'
                    }}>
                      <span style={{ color: course.color }}>✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details Sections */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '40px'
          }}>
            {/* Main Content */}
            <div>
              {/* Detailed Description */}
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '1.8rem',
                  color: '#1e293b',
                  marginBottom: '20px'
                }}>
                  About This Course
                </h2>
                <p style={{
                  lineHeight: '1.8',
                  color: '#475569',
                  fontSize: '16px'
                }}>
                  {course.detailedDescription}
                </p>
              </div>

              {/* Course Curriculum */}
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  fontSize: '1.8rem',
                  color: '#1e293b',
                  marginBottom: '25px'
                }}>
                  Course Curriculum
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {course.modules.map((module, index) => (
                    <div key={index} style={{
                      padding: '20px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: course.color,
                        color: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                          {module}
                        </h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                          Video lectures • Practice exercises • Assessments
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructor & Stats Sidebar */}
            <div>
              {/* Instructor Card */}
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                marginBottom: '30px'
              }}>
                <h3 style={{
                  marginBottom: '20px',
                  color: '#1e293b',
                  fontSize: '1.3rem'
                }}>
                  Course Instructor
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${course.color}, ${course.color}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>
                    {course.instructor.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>
                      {course.instructor}
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                      Industry Expert
                    </p>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                  With years of experience in the industry, our instructor brings real-world insights and practical knowledge to help you succeed.
                </p>
              </div>

              {/* Course Stats */}
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <h3 style={{
                  marginBottom: '20px',
                  color: '#1e293b',
                  fontSize: '1.3rem'
                }}>
                  Course Statistics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Students Enrolled</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{course.enrollmentCount}+</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Course Rating</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{course.rating} ⭐</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Duration</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{course.duration}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Level</span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: course.color,
                      background: `${course.color}20`,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section style={{ padding: '60px 20px', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: '2rem',
              color: '#1e293b',
              marginBottom: '50px'
            }}>
              Related Courses
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              {relatedCourses.map(relatedCourse => (
                <div key={relatedCourse._id} style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={relatedCourse.image} 
                      alt={relatedCourse.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: relatedCourse.color,
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {relatedCourse.level}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        background: '#e2e8f0',
                        color: '#64748b',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        ⏱️ {relatedCourse.duration}
                      </span>
                    </div>
                    <h3 style={{
                      margin: '0 0 10px 0',
                      color: '#1e293b',
                      fontSize: '1.3rem'
                    }}>
                      {relatedCourse.title}
                    </h3>
                    <p style={{
                      color: '#64748b',
                      marginBottom: '20px',
                      lineHeight: '1.5',
                      fontSize: '14px'
                    }}>
                      {relatedCourse.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontWeight: 'bold',
                        color: '#1e293b',
                        fontSize: '1.1rem'
                      }}>
                        {relatedCourse.price}
                      </span>
                      <Link 
                        to={`/courses/${relatedCourse._id}`}
                        style={{
                          padding: '8px 16px',
                          background: relatedCourse.color,
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = relatedCourse.color;
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = relatedCourse.color;
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CourseDetails;