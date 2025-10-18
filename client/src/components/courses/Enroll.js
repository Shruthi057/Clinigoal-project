import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Enroll.css';

const EnrollPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get course data from localStorage or use fallback
  const getCourseData = () => {
    try {
      const savedCourses = localStorage.getItem('clinigoalCourses');
      if (savedCourses) {
        const parsedCourses = JSON.parse(savedCourses);
        const course = parsedCourses.find(c => c._id == id);
        if (course) {
          return {
            id: course._id,
            title: course.title,
            price: course.price || '₹15,999',
            originalPrice: course.originalPrice,
            instructor: course.instructor,
            duration: course.duration,
            description: course.description
          };
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    }

    // Fallback courses if not found in localStorage
    const fallbackCourses = {
      1: {
        id: 1,
        title: "Clinical Research",
        price: "₹15,999",
        originalPrice: "₹19,999",
        instructor: "Dr. Sarah Wilson",
        duration: "6 Months",
        description: "Comprehensive training in clinical trial design, management, and regulatory compliance"
      },
      2: {
        id: 2,
        title: "Bioinformatics",
        price: "₹18,999",
        originalPrice: "₹22,999",
        instructor: "Prof. Michael Chen",
        duration: "8 Months",
        description: "Master computational methods for analyzing biological data and genomic research"
      },
      3: {
        id: 3,
        title: "Medical Coding",
        price: "₹12,999",
        originalPrice: "₹15,999",
        instructor: "Ms. Anjali Patel",
        duration: "5 Months",
        description: "Learn accurate medical coding practices and healthcare documentation"
      },
      4: {
        id: 4,
        title: "Pharmacovigilance",
        price: "₹16,999",
        originalPrice: "₹20,999",
        instructor: "Dr. Robert Kim",
        duration: "7 Months",
        description: "Master drug safety monitoring and adverse event reporting"
      }
    };

    return fallbackCourses[id] || null;
  };

  const course = getCourseData();

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: ''
  });

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    // Convert price to amount in paise (Razorpay expects amount in paise)
    const priceToAmount = (price) => {
      const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
      return numericPrice * 100;
    };
    
    return {
      id: `order_${Date.now()}`,
      amount: priceToAmount(course.price),
      currency: "INR",
      name: "Clinigoal",
      description: `Enrollment for ${course.title}`,
      image: "/logo.png", // Replace with your logo
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      }
    };
  };

  const enrollUser = async (paymentDetails) => {
    // Store enrollment data in localStorage
    const existingEnrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]');
    
    const newEnrollment = {
      id: `enrollment_${Date.now()}`,
      courseId: course.id,
      courseTitle: course.title,
      coursePrice: course.price,
      enrollmentDate: new Date().toISOString(),
      paymentId: paymentDetails.razorpay_payment_id,
      orderId: paymentDetails.razorpay_order_id,
      studentName: formData.name,
      studentEmail: formData.email,
      studentPhone: formData.phone,
      progress: 0,
      status: 'active'
    };
    
    existingEnrollments.push(newEnrollment);
    localStorage.setItem('userEnrollments', JSON.stringify(existingEnrollments));
    
    return { success: true, enrollmentId: newEnrollment.id };
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in all the required fields');
      setIsProcessing(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      setIsProcessing(false);
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
      alert('Please enter a valid 10-digit phone number');
      setIsProcessing(false);
      return;
    }

    try {
      // Load Razorpay if not already loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Create order
      const order = await createOrder();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Use environment variable
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        image: order.image,
        order_id: order.id,
        prefill: {
          name: order.prefill.name,
          email: order.prefill.email,
          contact: order.prefill.contact
        },
        notes: {
          address: "Clinigoal Office",
          merchant_order_id: order.id
        },
        theme: {
          color: "#0077B6"
        },
        handler: async function (response) {
          // Payment successful
          try {
            // Enroll the user
            const enrollmentResult = await enrollUser(response);
            if (enrollmentResult.success) {
              alert('🎉 Enrollment successful! You can now access your course from the dashboard.');
              navigate('/userdashboard', { state: { activeSection: 'my-courses' } });
            } else {
              alert('Enrollment failed. Please contact support.');
            }
          } catch (error) {
            console.error('Enrollment error:', error);
            alert('Enrollment failed. Please try again.');
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
          escape: false,
          confirm_close: true
        },
        checkout: {
          method: {
            netbanking: true,
            card: true,
            upi: true,
            wallet: true,
            emi: true,
            paylater: true
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment failed. Please try again.');
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!course) {
    return (
      <div className="enroll-page">
        <div className="enroll-container">
          <div className="not-found">
            <h1>Course Not Found</h1>
            <p>The course you're trying to enroll in doesn't exist.</p>
            <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enroll-page">
      <div className="enroll-container">
        <div className="enroll-header">
          <h1>Enroll in {course.title}</h1>
          <p>Complete your enrollment in just a few simple steps</p>
        </div>

        <div className="enroll-content">
          <div className="enroll-form-container">
            <form onSubmit={handlePayment} className="enroll-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address *"
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number *"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-info">
                  <div className="razorpay-info">
                    <div className="razorpay-logo">
                      <span>Razorpay</span>
                    </div>
                    <p>Secure payment processing through Razorpay</p>
                    <ul className="payment-features">
                      <li>✓ Credit/Debit Cards</li>
                      <li>✓ UPI</li>
                      <li>✓ Net Banking</li>
                      <li>✓ Wallets</li>
                      <li>✓ EMI</li>
                      <li>✓ Pay Later</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="enroll-summary">
                <h3>Order Summary</h3>
                <div className="summary-item">
                  <span>{course.title}</span>
                  <span>{course.price}</span>
                </div>
                {course.originalPrice && (
                  <div className="summary-discount">
                    <span>Original Price</span>
                    <span className="original-price">{course.originalPrice}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span>Instructor</span>
                  <span>{course.instructor}</span>
                </div>
                <div className="summary-item">
                  <span>Duration</span>
                  <span>{course.duration}</span>
                </div>
                
                <div className="summary-total">
                  <span>Amount to Pay</span>
                  <span>{course.price}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="enroll-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  `Pay with Razorpay - ${course.price}`
                )}
              </button>

              <div className="security-note">
                <p>🔒 Your payment information is secure and encrypted</p>
              </div>
            </form>
          </div>

          <div className="enroll-info">
            <div className="course-preview">
              <h2>Course Overview</h2>
              <div className="course-details">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span>👨‍🏫 {course.instructor}</span>
                  <span>⏱️ {course.duration}</span>
                </div>
              </div>
            </div>

            <h2>What You'll Get</h2>
            <ul className="benefits-list">
              <li>✅ Lifetime access to course materials</li>
              <li>✅ Certificate of completion</li>
              <li>✅ 1-on-1 instructor support</li>
              <li>✅ Course assignments and projects</li>
              <li>✅ Access to our community forum</li>
              <li>✅ 30-day money-back guarantee</li>
              <li>✅ Industry-recognized certification</li>
              <li>✅ Career placement assistance</li>
            </ul>
            
            <div className="additional-info">
              <h3>Payment Information</h3>
              <p>✅ Secure payment through Razorpay</p>
              <p>✅ Multiple payment options available</p>
              <p>✅ Instant access after payment confirmation</p>
              <p>✅ Payment details are encrypted and secure</p>
            </div>

            <div className="support-info">
              <h3>Need Help?</h3>
              <p>Contact our support team:</p>
              <p>📧 support@clinigoal.com</p>
              <p>📞 +91-9876543210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollPage;