import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Enroll.css';

const EnrollPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const courses = {
    1: {
      id: 1,
      title: "Clinical Research",
      price: "₹89,999"
    },
    2: {
      id: 2,
      title: "Bioinformatics",
      price: "₹1,19,999"
    },
    3: {
      id: 3,
      title: "Medical Coding",
      price: "₹74,999"
    },
    4: {
      id: 4,
      title: "Pharmacovigilance",
      price: "₹94,999"
    }
  };

  const course = courses[id];

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
    // In a real app, this would be an API call to your backend
    const coursePrices = {
      1: 89999,
      2: 119999,
      3: 74999,
      4: 94999
    };
    
    return {
      id: `order_${Date.now()}`,
      amount: coursePrices[id] * 100, // Razorpay expects amount in paise
      currency: "INR",
      name: "Clinigoal",
      description: `Enrollment for ${course.title}`,
      image: "https://example.com/your_logo",
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      }
    };
  };

  const enrollUser = async (paymentDetails) => {
    // In a real app, this would be an API call to your backend
    // to store the enrollment information in the user's dashboard
    
    // Store enrollment data in localStorage for demo purposes
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
      progress: 0
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
      key: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your Razorpay key
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
        color: "#3399cc"
      },
      handler: async function (response) {
        // Payment successful
        try {
          // Enroll the user
          const enrollmentResult = await enrollUser(response);
          if (enrollmentResult.success) {
            alert('Enrollment successful! You can now access your course from the dashboard.');
            navigate('/dashboard'); // Redirect to dashboard
          } else {
            alert('Enrollment failed. Please contact support.');
          }
        } catch (error) {
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
  };

  if (!course) {
    return (
      <div className="not-found">
        <h1>Course Not Found</h1>
        <p>The course you're trying to enroll in doesn't exist.</p>
        <button onClick={() => navigate('/courses')} className="home-link">Back to Courses</button>
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
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
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
                {isProcessing ? 'Processing...' : `Pay with Razorpay - ${course.price}`}
              </button>
            </form>
          </div>

          <div className="enroll-info">
            <h2>What You'll Get</h2>
            <ul className="benefits-list">
              <li>Lifetime access to course materials</li>
              <li>Certificate of completion</li>
              <li>1-on-1 instructor support</li>
              <li>Course assignments and projects</li>
              <li>Access to our community forum</li>
              <li>30-day money-back guarantee</li>
            </ul>
            
            <div className="additional-info">
              <h3>Payment Information</h3>
              <p>✅ Secure payment through Razorpay</p>
              <p>✅ Multiple payment options available</p>
              <p>✅ Instant access after payment confirmation</p>
              <p>✅ Payment details are encrypted and secure</p>
            </div>

            <div className="security-info">
              <h3>🔒 Secure Payment</h3>
              <p>Your payment information is encrypted and secure</p>
              <p>We support SSL encryption for all transactions</p>
            </div>
            
            <div className="razorpay-links">
              <h3>Razorpay</h3>
              <p>We use Razorpay, India's most popular payment gateway, to process your payments securely.</p>
              <div className="razorpay-badges">
                <a href="https://razorpay.com/" target="_blank" rel="noopener noreferrer" className="razorpay-link">
                  <img src="https://razorpay.com/badge/razorpay-logo.png" alt="Razorpay" height="40" />
                </a>
                <a href="https://razorpay.com/security" target="_blank" rel="noopener noreferrer" className="razorpay-link">
                  <img src="https://razorpay.com/badge/security-badge.png" alt="Secure" height="40" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollPage;