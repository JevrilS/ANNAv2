// LandingPage.js
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

import api from '../../styles/../utils/api'; // Import the Axios instance


window.$ = $;
window.jQuery = $;

const LandingPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [auth, setAuth] = useState(false); // Add state for authentication
  const { setShowbot } = useContext(ChatbotContext);

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
  

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuth(true);
    }
  }, []);

  // Listen for login success event
  useEffect(() => {
    const handleLoginSuccess = () => {
      setAuth(true); // Update auth state to true
      setShowbot(true); // Show the chatbot after login
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);
  
  useEffect(() => {
    // Add event listener for loginSuccess event
    const handleLoginSuccess = () => {
      // Trigger a re-render or refresh the data
      setRefresh(prev => !prev);  // Toggle the refresh state to re-render the component
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  // Fetch or update the component based on refresh state
  useEffect(() => {
    // Fetch data or perform any action to update the page
  }, [refresh]);
const fetchUserInfo = async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const response = await api.get('/api/user/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        const { name, age, sex, strand, grade_level } = response.data;
        setUser({
          name,
          age,
          sex,
          strand,
          grade_level,
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }
};

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
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err.message);
      toast.error('Registration failed. Please try again.');
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
  
    </>
  );
};

export default LandingPage;
