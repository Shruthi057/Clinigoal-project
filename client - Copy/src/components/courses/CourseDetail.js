import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const courses = {
    1: {
      id: 1,
      title: "Clinical Research",
      description: "Comprehensive training in clinical trial design, management, and regulatory compliance.",
      fullDescription: "Our Clinical Research course provides in-depth knowledge of clinical trial processes, regulatory requirements, and best practices. You'll learn about protocol development, patient recruitment, data management, and regulatory submissions.",
      duration: "6 Months",
      level: "Advanced",
      price: "$1,299",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      instructor: "Dr. Sarah Johnson",
      rating: 4.8,
      students: 1245,
      modules: [
        "Introduction to Clinical Research",
        "Clinical Trial Design",
        "Regulatory Compliance",
        "Data Management",
        "Patient Safety",
        "Ethical Considerations"
      ],
      features: [
        "40 hours of video content",
        "Downloadable resources",
        "Certificate of completion",
        "Access on mobile and TV",
        "Assignments and projects"
      ]
    },
    2: {
      id: 2,
      title: "Bioinformatics",
      description: "Master computational methods for analyzing biological data and genomic research.",
      fullDescription: "Dive into the world of bioinformatics with our comprehensive course covering genomic analysis, protein structure prediction, and computational biology techniques.",
      duration: "8 Months",
      level: "Intermediate",
      price: "$1,599",
      image: "https://images.unsplash.com/photo-1579165460885-f4de5a0ad776?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      instructor: "Dr. Michael Chen",
      rating: 4.7,
      students: 987,
      modules: [
        "Genomic Data Analysis",
        "Protein Structure Prediction",
        "Molecular Modeling",
        "Sequence Alignment",
        "Phylogenetic Analysis",
        "Systems Biology"
      ],
      features: [
        "50 hours of video content",
        "Interactive coding exercises",
        "Certificate of completion",
        "Access on mobile and TV",
        "Real-world projects"
      ]
    },
    3: {
      id: 3,
      title: "Medical Coding",
      description: "Learn accurate medical coding for healthcare billing and insurance claims.",
      fullDescription: "Master the art of medical coding with our specialized course covering ICD-10, CPT, and HCPCS coding systems.",
      duration: "4 Months",
      level: "Beginner",
      price: "$999",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      instructor: "Jennifer Williams",
      rating: 4.9,
      students: 1567,
      modules: [
        "ICD-10 Coding Guidelines",
        "CPT Procedure Coding",
        "HCPCS Level II",
        "Medical Terminology",
        "Billing and Reimbursement",
        "Compliance and Auditing"
      ],
      features: [
        "30 hours of video content",
        "Coding practice exercises",
        "Certificate of completion",
        "Access on mobile and TV",
        "Real-world case studies"
      ]
    },
    4: {
      id: 4,
      title: "Pharmacovigilance",
      description: "Specialized training in drug safety monitoring and adverse event reporting.",
      fullDescription: "Learn the principles and practices of pharmacovigilance including signal detection, risk management, and regulatory reporting.",
      duration: "5 Months",
      level: "Intermediate",
      price: "$1,199",
      image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      instructor: "Dr. Robert Martinez",
      rating: 4.6,
      students: 876,
      modules: [
        "Introduction to Pharmacovigilance",
        "Adverse Event Reporting",
        "Signal Detection",
        "Risk Management",
        "Regulatory Requirements",
        "Pharmacoepidemiology"
      ],
      features: [
        "35 hours of video content",
        "Case studies and examples",
        "Certificate of completion",
        "Access on mobile and TV",
        "Regulatory guidelines"
      ]
    }
  };

  const course = courses[id];

  if (!course) {
    return (
      <div className="not-found">
        <h1>Course Not Found</h1>
        <p>The course you're looking for doesn't exist.</p>
        <Link to="/courses" className="home-link">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <div className="course-hero">
        <div className="course-hero-image">
          <img src={course.image} alt={course.title} />
        </div>
        <div className="course-hero-content">
          <div className="course-badges">
            <span className="course-badge">{course.level}</span>
            <span className="course-badge">{course.duration}</span>
          </div>
          <h1>{course.title}</h1>
          <p className="course-description">{course.description}</p>
          
          <div className="course-meta">
            <div className="course-instructor">
              <span className="instructor-avatar">👤</span>
              <span>{course.instructor}</span>
            </div>
            <div className="course-rating">
              <span className="stars">★★★★★</span>
              <span>{course.rating} ({course.students} students)</span>
            </div>
          </div>
          
          <div className="course-price">{course.price}</div>
          
          <div className="course-actions">
            <Link to={`/enroll/${course.id}`} className="btn-primary">Enroll Now</Link>
          </div>
        </div>
      </div>

      <div className="course-container">
        <div className="course-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => setActiveTab('modules')}
          >
            Modules
          </button>
          <button 
            className={`tab-btn ${activeTab === 'instructor' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructor')}
          >
            Instructor
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className="course-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>Course Description</h2>
              <p>{course.fullDescription}</p>
              
              <h2>What You'll Learn</h2>
              <div className="features-grid">
                {course.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <h2>Requirements</h2>
              <ul className="requirements-list">
                <li>Basic understanding of healthcare concepts</li>
                <li>Access to a computer with internet connection</li>
                <li>Dedication to complete the course successfully</li>
              </ul>
            </div>
          )}
          
          {activeTab === 'modules' && (
            <div className="tab-content">
              <h2>Course Modules</h2>
              <div className="modules-list">
                {course.modules.map((module, index) => (
                  <div key={index} className="module-item">
                    <div className="module-header">
                      <div className="module-number">{index + 1}</div>
                      <h3>{module}</h3>
                    </div>
                    <div className="module-content">
                      <p>Comprehensive coverage of {module.toLowerCase()} principles and practices</p>
                      <div className="module-meta">
                        <span>6 lessons</span>
                        <span>45 min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'instructor' && (
            <div className="tab-content">
              <h2>Instructor</h2>
              <div className="instructor-profile">
                <div className="instructor-avatar-large">👤</div>
                <div className="instructor-info">
                  <h3>{course.instructor}</h3>
                  <p>Expert in {course.title} with over 10 years of experience in the field. Passionate about teaching and helping students achieve their career goals.</p>
                  <div className="instructor-stats">
                    <div className="stat-item">
                      <span className="stat-value">15+</span>
                      <span className="stat-label">Years Experience</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">5000+</span>
                      <span className="stat-label">Students Taught</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">24</span>
                      <span className="stat-label">Courses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="tab-content">
              <h2>Student Reviews</h2>
              <div className="reviews-summary">
                <div className="reviews-rating">
                  <div className="rating-value">{course.rating}</div>
                  <div className="rating-stars">★★★★★</div>
                  <div className="rating-count">({course.students} reviews)</div>
                </div>
                <div className="rating-bars">
                  <div className="rating-bar">
                    <span className="bar-label">5 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '85%' }}></div>
                    </div>
                    <span className="bar-value">85%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">4 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '10%' }}></div>
                    </div>
                    <span className="bar-value">10%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">3 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '3%' }}></div>
                    </div>
                    <span className="bar-value">3%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">2 stars</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '1%' }}></div>
                    </div>
                    <span className="bar-value">1%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="bar-label">1 star</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: '1%' }}></div>
                    </div>
                    <span className="bar-value">1%</span>
                  </div>
                </div>
              </div>
              
              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">👤</div>
                    <div className="reviewer-info">
                      <div className="reviewer-name">Alex Johnson</div>
                      <div className="review-rating">★★★★★</div>
                    </div>
                    <div className="review-date">2 weeks ago</div>
                  </div>
                  <div className="review-content">
                    <p>This course exceeded my expectations! The instructor is knowledgeable and explains complex concepts in an easy-to-understand manner. Highly recommended!</p>
                  </div>
                </div>
                
                <div className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">👤</div>
                    <div className="reviewer-info">
                      <div className="reviewer-name">Sarah Williams</div>
                      <div className="review-rating">★★★★☆</div>
                    </div>
                    <div className="review-date">1 month ago</div>
                  </div>
                  <div className="review-content">
                    <p>Great course with comprehensive content. The modules are well-structured and the assignments helped reinforce the concepts. Would have liked more practical examples.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;