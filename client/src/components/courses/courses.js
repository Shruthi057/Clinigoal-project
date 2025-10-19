import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import './courses.css';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch courses from admin dashboard storage - Same as home.js
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
          price: course.price || '₹15,999', // Same price display as home.js
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

        setCourses(formattedCourses);
      } else {
        setCourses(getFallbackCourses());
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(getFallbackCourses());
    } finally {
      setLoading(false);
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

  const getFallbackCourses = () => [
    {
      _id: 1,
      title: "Clinical Research",
      description: "Comprehensive training in clinical trial design, management, and regulatory compliance for healthcare professionals.",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      duration: "6 Months",
      level: "Advanced",
      price: "₹15,999",
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

  if (loading) {
    return (
      <div className="courses-page loading">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading Courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="container">
        <div className="courses-header">
          <h1>Our Courses</h1>
          <p>Explore our comprehensive range of healthcare courses designed to advance your career</p>
        </div>
        
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-image">
                <img 
                  src={course.image} 
                  alt={course.title}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="course-badge" style={{ backgroundColor: course.color }}>
                  {course.level}
                </div>
              </div>
              <div className="course-content">
                <div className="course-meta">
                  <span className="duration">⏱️ {course.duration}</span>
                  <span className="instructor">👨‍🏫 {course.instructor}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                {/* Added Price Display - Same as home.js */}
                <div className="course-price">
                  <span className="price">{course.price}</span>
                </div>
                <div className="course-actions">
                  <Link to={`/courses/${course._id}`} className="btn-primary">View Details</Link>
                  <Link to={`/enroll/${course._id}`} className="btn-secondary">Enroll Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;