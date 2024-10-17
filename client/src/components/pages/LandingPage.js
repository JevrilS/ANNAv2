// LandingPage.js
import { Modal as BootstrapModal } from 'bootstrap'; // Import Bootstrap Modal instance methods
import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useContext, useState, useEffect } from 'react';
import Header from '../Header';
import Modal from '../Modal';
import anna from '../../assets/Anna_1.svg';
import anna2 from '../../assets/Anna_2.svg';
import { ChatbotContext } from '../../context/ChatbotContext';
import { toast } from 'react-toastify';
import Chatbot from '../chatbot/Chatbot';
import '../../styles/style.css';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import api from '../../styles/../utils/api'; // Import the Axios instance


window.$ = $;
window.jQuery = $;

const LandingPage = () => {
  const [auth, setAuth] = useState(false); // Add state for authentication
  const { setShowbot } = useContext(ChatbotContext);
  const [showTvlSubstrand, setShowTvlSubstrand] = useState(false);

  const [formData, setFormData] = useState({
    id_no: '',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    school_id: '',
    mobile_no: '',
    sex: '',
    age: '',  // Add age
    strand: '',
    grade_level: ''
  });

  const [feedbackData, setFeedbackData] = useState({
    feedbackEmail: '',
    feedback: '',
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const {setUser } = useContext(ChatbotContext); 
  const navlinks = [
    { text: 'Home', link: '/#home' },
    { text: 'Learn RIASEC', link: '/#learn-riasec' },
    { text: 'Feedback', link: '/#feedback' },
  ];
  useEffect(() => {
    checkAuthStatus(); // Check if the user is authenticated when the component mounts
  }, []);
  
  const handleModalHide = () => {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuth(true);
    }
  }, []);

  useEffect(() => {
    $('#modal-login').on('hidden.bs.modal', handleModalHide);
    $('#modal-register').on('hidden.bs.modal', handleModalHide);

    return () => {
      $('#modal-login').off('hidden.bs.modal', handleModalHide);
      $('#modal-register').off('hidden.bs.modal', handleModalHide);
    };
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await api.get('/schools/');
        setSchools(response.data);
      } catch (error) {
        console.error('Error fetching schools:', error);
        toast.error('Failed to fetch schools');
      }
    };
  
    fetchSchools();
  }, []);
  

  const [inputs, setInputs] = useState({ feedbackEmail: '', feedback: '' });
  const { feedbackEmail, feedback } = inputs;

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFeedbackChange = (e) => {
    setFeedbackData({ ...feedbackData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);

    if (!formData.id_no || !formData.full_name || !formData.email || !formData.password || !formData.confirm_password) {
      toast.error('Please fill in all required fields');
      return;
    }

    const data = {
      id_no: formData.id_no,
      full_name: formData.full_name,
      email: formData.email, // Fixed here
      password: formData.password,
      confirm_password: formData.confirm_password,
      school_id: formData.school_id,
      mobile_no: formData.mobile_no,
      sex: formData.sex,
      strand: formData.strand,
      grade_level: formData.grade_level,
    };

    console.log('Data to be sent:', data);

    try {
      const response = await api.post('/register/', data, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });
      if (response.status === 201) {
        toast.success(response.data.message);
        setShowRegisterModal(false);
        setShowLoginModal(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err.message);
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
        email: e.target.loginEmail.value,
        password: e.target.loginPassword.value,
    };

    console.log('Login Data:', loginData);

    try {
        const response = await api.post('/auth/token/', loginData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Login Response:', response);
        console.log('Login Response Data:', response.data);

        if (response.status === 200 && response.data.access) {
            setAuth(true);  // Update authentication state to logged in
            localStorage.setItem('authToken', response.data.access);  // Store access token for the main app
            localStorage.setItem('token', response.data.access);      // Store access token for the chatbot
            localStorage.setItem('refreshToken', response.data.refresh); // Store refresh token

            toast.success('Login successful!');
            window.location.reload();  // Reload the window to trigger the chatbot refresh
        } else {
            toast.error('Login failed. Please check your credentials.');
        }
    } catch (err) {
        console.error('Login Error:', err.response ? err.response.data : err.message);
        toast.error('Login failed. Please check your credentials.');
    }
};
const handleLogout = () => {
  // Remove tokens from localStorage
  localStorage.removeItem('authToken');  // Main auth token
  localStorage.removeItem('token');      // Chatbot access token
  localStorage.removeItem('refreshToken');  // Refresh token
  
  // Reset authentication and chatbot states
  setAuth(false);        // Set authentication state to logged out
  setShowbot(false);     // Hide chatbot after logout
  
  // Safely check if setUser is available before calling it
  if (typeof setUser === 'function') {
    setUser(null);      // Clear user data in chatbot context, if applicable
  }

  toast.success('Logged out successfully!');
  window.location.reload();  // Reload the window to apply changes
};

const handleRegister = async (e) => {
  e.preventDefault();
  const csrftoken = getCookie('csrftoken');
  console.log('Form Data: ', formData); // Log form data to console for debugging

  try {
    const response = await api.post('/register/', formData, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
    });
    console.log(response.data);
    
    if (response.status === 201) {
      toast.success('User registered successfully');
      setShowRegisterModal(false); // Close the registration modal
      setShowLoginModal(true); // Show the login modal
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error('Registration Error:', error.response.data);
    toast.error(error.response.data.message);
  }
};
const checkAuthStatus = async () => {
  const token = localStorage.getItem('authToken'); // Get token from localStorage

  if (token) {
    try {
      const response = await api.get('/api/check_login_status/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If the token is valid, the user is logged in
      if (response.status === 200) {
        setAuth(true);
      } else {
        handleLogout();  // Log out if token is invalid
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      handleLogout();  // Log out and clear tokens on error
    }
  } else {
    setAuth(false); // No token means not logged in
  }
};

  // Remove any lingering backdrops or modal-open classes when a modal is hidden
  const cleanupModals = () => {
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  };

  // Ensure cleanup when a modal closes
  useEffect(() => {
    if (!showLoginModal && !showRegisterModal) {
      cleanupModals();
    }
  }, [showLoginModal, showRegisterModal]);

  // Toggle between modals
  const openRegisterFromLogin = () => {
    setShowLoginModal(false); // Close login modal
    setTimeout(() => {
      setShowRegisterModal(true); // Open register modal after delay
    }, 300); // Delay to ensure smooth transition
  };
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === `${name}=`) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    // Implement the feedback submission logic here
  };

  return (
    <>
      <Header navlinks={navlinks} auth={auth} handleLogout={handleLogout} />
      <section
        id='home'
        className='section section-first bg-white container d-flex flex-column flex-lg-row align-items-center justify-content-between my-0 px-0'
      >
        <div className='d-flex flex-column align-items-center align-items-lg-start px-4 order-1 order-lg-0' style={{ width: '65%' }}>
          <div>
            <h1 className='text-wrap custom-heading d-inline-block'>Meet Chatbot,</h1>
            <h1 className='d-inline-block text-primary custom-heading ms-1'>Anna</h1>
          </div>
          <p className='mb-3'>
            Anna is a web-based chatbot application that aims to aid senior high school students who will be transitioning to higher education
            with their career planning by providing them with initial steps to identify their suitable degree programs.
          </p>
          <button className='btn btn-primary btn-lg rounded-pill mb-5 mb-lg-0' onClick={() => setShowbot(true)}>
            Get Started
          </button>
        </div>
        <div className='order-0 order-lg-1 mb-5 mb-lg-0'>
          <img src={anna} alt='Anna' className='anna-img' />
        </div>
      </section>

      <section id='learn-riasec' className='section bg-white'>
        <div className='container d-flex flex-column px-0'>
          <h1 className='custom-heading text-primary mb-5 text-center'>LEARN RIASEC</h1>
          <div className='container bg-grey rounded p-5'>
            <div className='d-flex flex-column flex-lg-row align-items-center align-items-lg-start justify-content-between'>
              <div>
                <iframe
                  id='playlist'
                  loading='lazy'
                  src='https://www.youtube.com/embed/fyR6yJifLHI?loop=1&playlist=fyR6yJifLHI'
                  width='480'
                  height='270'
                  title='RIASEC - Personality Type'
                  frameBorder='0'
                  allowFullScreen
                ></iframe>
                <div className='text-center bg-primary rounded p-2 mt-1'>
                  Video by <strong>Career Library</strong> on{' '}
                  <a className='text-decoration-none' href='https://www.youtube.com' target='_blank' rel='noreferrer'>
                    YouTube
                  </a>
                </div>
              </div>

              <div className='d-flex flex-column align-items-center align-items-lg-start mt-5 mt-lg-0 ms-lg-5'>
                <h1 className='custom-heading text-primary'>What is RIASEC test?</h1>
                <p>
                  The RIASEC test was based on Holland’s theory, in which he proposed that careers can be classified into six areas:
                  Realistic, Investigative, Artistic, Social, Enterprising and Conventional. Thus, these six areas can be used to describe a
                  person's personality, ability, skills, and interests. Also, it is a standardized test that was designed to help students
                  discover the most suitable career for them and has been administered by several universities inside or outside the
                  Philippines and these universities believed that the RIASEC test really serves its purpose of helping students.
                </p>
                <p>Watch the video to learn more about the components of RIASEC.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='feedback' className='section bg-white'>
        <div className='container d-flex flex-column px-0 '>
          <h1 className='custom-heading mb-5 text-center text-primary'>FEEDBACK</h1>
          <form className='d-flex flex-column justify-content-center align-items-center px-4' noValidate onSubmit={handleFeedbackSubmit}>
            <div className='mb-4 w-100'>
              <input
                className='form-control'
                value={feedbackEmail}
                type='email'
                id='feedbackEmail'
                name='feedbackEmail'
                required
                placeholder='Email Address'
                onChange={handleInputChange}
              />
              {!feedbackEmail && <div className='invalid-feedback py-1 px-1'>Email can't be empty</div>}
            </div>
            <div className='mb-4 w-100'>
              <textarea
                className='form-control'
                value={feedback}
                id='feedback'
                name='feedback'
                required
                rows='12'
                placeholder='Tell us how can we improve...'
                onChange={handleInputChange}
              ></textarea>
              {!feedback && <div className='invalid-feedback py-1 px-1'>Feedback can't be empty</div>}
            </div>
            <button className='btn btn-primary rounded-pill px-3' type='submit'>
              Submit
            </button>
          </form>
        </div>
      </section>
      <Chatbot />

      <footer className='mt-auto bg-primary'>
        <div className='p-5 pb-0 text-center'>
          <div className='row flex-wrap justify-content-center justify-content-md-start'>
            <div className='col-11 col-md-5 d-flex flex-column'>
              <a className='text-decoration-none' href='/'>
                <div className='d-flex align-items-center mb-4'>
                  <img className='anna-logo' src={anna2} alt='anna-logo' />
                  <h1 className='h1 ms-3 custom-heading text-white'>Anna</h1>
                </div>
              </a>
              <small className='text-start'>
                Anna is a web-based chatbot application that aims to aid senior high school students who will be transitioning to higher
                education with their career planning by providing them with initial steps to identify their suitable degree programs.
              </small>
            </div>
            <div className='col-11 col-md-2 d-flex flex-column mt-3 mt-md-0'>
              <h4 className='h5 custom-heading mb-4 text-start'>Useful links</h4>
              <ul className='footer-links text-start'>
                <li>
                  <a href='/#home'>
                    <small>Home</small>
                  </a>
                </li>
                <li>
                  <a href='/#about'>
                    <small>About</small>
                  </a>
                </li>

                <li>
                  <a href='/#terms-conditions'>
                    <small>Terms & Conditions</small>
                  </a>
                </li>
                <li>
                  <a href='/#feedback'>
                    <small>Feedback</small>
                  </a>
                </li>
                <li>
                  <a href='#modal-login' data-bs-toggle='modal' data-bs-target='#modal-login'>
                    <small>Login</small>
                  </a>
                </li>
                <li>
                  <a href='#modal-register' data-bs-toggle='modal' data-bs-target='#modal-register'>
                    <small>Register</small>
                  </a>
                </li>
              </ul>
            </div>
            <div className='col-11 col-md-2 d-flex flex-column mt-3 mt-md-0'>
              <h4 className='h5 custom-heading mb-4 text-start'>Address</h4>
              <small className='text-start'>
                University of the Immaculate Conception Father Selga St., Davao City, Davao del Sur Philippines 8000
              </small>
            </div>
            <div className='col-11 col-md-2 d-flex flex-column mt-3 mt-md-0'>
              <h4 className='h5 custom-heading mb-4 text-start'>Contact Us</h4>
              <small className='text-start'>anna.capstone24@gmail.com</small>
            </div>
          </div>
        </div>
        <small className='w-100 d-block mt-5 p-2 text-center bg-primary-dark'>ANNA | Copyright © 2022</small>
      </footer>
    <Modal
  title='Login'
  target='modal-login'
  size='modal-lg'
  show={showLoginModal}
  onHide={() => setShowLoginModal(false)} // Closes the login modal
  dialogClassName='login-modal' // Custom class for styling
>
  <form onSubmit={handleLogin} className='login-form'>
    <div className='d-flex flex-column align-items-center'>
      <img src={anna} alt='Anna' className='mb-3' style={{ width: '150px', height: '150px' }} />
      <h2 className='mb-3 modal-title'>Sign In</h2>
    </div>
    <div className='mb-3 input-group'>
      <span className='input-group-text'>
        <i className='fas fa-envelope'></i>
      </span>
      <input
        type='email'
        className='form-control'
        id='loginEmail'
        placeholder='Email'
        required
      />
    </div>
    <div className='mb-3 input-group'>
      <span className='input-group-text'>
        <i className='fas fa-lock'></i>
      </span>
      <input
        type='password'
        className='form-control'
        id='loginPassword'
        placeholder='Password'
        required
      />
    </div>
    <div className='d-flex justify-content-center w-100'>
      <a
        href='#changePasswordModal'
        data-bs-toggle='modal'
        className='forgot-password-link'
      >
        Forgot Password?
      </a>
    </div>
    <div className='d-flex justify-content-center mt-3'>
      <button className='btn btn-primary' type='submit'>
        Login
      </button>
    </div>
    <div className='text-center mt-3 dont-have-account'>
      <span>
        Don't have an account?
        <button
          type='button'
          className='btn btn-link signup-button'
          onClick={() => {
            // Get the login modal Bootstrap instance
            const loginModal = BootstrapModal.getInstance(document.getElementById('modal-login'));
            if (loginModal) {
              loginModal.hide(); // Hide the login modal
            }
            // After login modal is hidden, show the register modal
            setTimeout(() => {
              setShowLoginModal(false); // Ensure Login modal state is false
              setShowRegisterModal(true);  // Show Register modal
            }, 300); // Slight delay to ensure smooth transition
          }}
        >
          Sign Up
        </button>
      </span>
    </div>
  </form>
</Modal>

<Modal
  title="Register"
  target="modal-register"
  size="modal-md"
  show={showRegisterModal}
  onHide={() => setShowRegisterModal(false)} // Closes the register modal
  dialogClassName="modal-dialog-centered register-modal" // Apply custom class for styling
>
  <form onSubmit={handleRegister} className="register-form">
    <div className="d-flex flex-column align-items-center">
      <h2 className="mb-3 modal-title">Register</h2>
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-id-card"></i>
      </span>
      <input
        type="text"
        className="form-control"
        id="id_no"
        placeholder="ID No."
        value={formData.id_no}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-user"></i>
      </span>
      <input
        type="text"
        className="form-control"
        id="full_name"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-envelope"></i>
      </span>
      <input
        type="email"
        className="form-control"
        id="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-key"></i>
      </span>
      <input
        type="password"
        className="form-control"
        id="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-key"></i>
      </span>
      <input
        type="password"
        className="form-control"
        id="confirm_password"
        placeholder="Confirm Password"
        value={formData.confirm_password}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-school"></i>
      </span>
      <select
        className="form-control"
        id="school_id"
        value={formData.school_id}
        onChange={handleChange}
        required
      >
        <option value="" hidden>
          Select School
        </option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.school_des}
          </option>
        ))}
      </select>
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-phone"></i>
      </span>
      <input
        type="text"
        className="form-control"
        id="mobile_no"
        placeholder="Mobile No."
        value={formData.mobile_no}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-venus-mars"></i>
      </span>
      <select
        className="form-control"
        id="sex"
        value={formData.sex}
        onChange={handleChange}
        required
      >
        <option value="" hidden>
          Sex
        </option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>

    {/* Add Age Field */}
    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-birthday-cake"></i>
      </span>
      <input
        type="number"
        className="form-control"
        id="age"
        placeholder="Age"
        value={formData.age}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-graduation-cap"></i>
      </span>
      <select
        className="form-control"
        id="strand"
        value={formData.strand}
        onChange={handleChange}
        required
      >
        <option value="" hidden>
          Strand
        </option>
        <option value="ABM">ABM</option>
        <option value="ARTSDESIGN">ARTS&DESIGN</option>
        <option value="STEM">STEM</option>
        <option value="HUMSS">HUMSS</option>
        <option value="TVL - Information and Communications Technology">
        TVL - Information and Communications Technology
        </option>
        <option value="TVL - Home Economics">TVL - Home Economics</option>
        <option value="TVL - Agri-Fishery Arts">TVL - Agri-Fishery Arts</option>
        <option value="TVL - Industrial Arts">TVL - Industrial Arts</option>
      </select>
    </div>

    <div className="mb-3 input-group">
      <span className="input-group-text">
        <i className="fas fa-level-up-alt"></i>
      </span>
      <select
        className="form-control"
        id="grade_level"
        value={formData.grade_level}
        onChange={handleChange}
        required
      >
        <option value="" hidden>
          Grade Level
        </option>
        <option value="11">Grade 11</option>
        <option value="12">Grade 12</option>
      </select>
    </div>

    <div className="d-flex justify-content-center w-100">
      <button type="submit" className="btn btn-primary">
        Register
      </button>
    </div>
  </form>
</Modal>


    </>
  );
};

export default LandingPage;
