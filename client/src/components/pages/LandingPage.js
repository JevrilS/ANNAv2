import React, { useContext, useState, useEffect  } from 'react';
import Header from '../Header';
import Modal from '../Modal';
import anna from '../../assets/Anna_1.svg';
import anna2 from '../../assets/Anna_2.svg';
import { ChatbotContext } from '../../context/ChatbotContext';
import { toast } from 'react-toastify';
import Chatbot from '../chatbot/Chatbot';
import '../../styles/style.css';
import axios from 'axios';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

window.$ = $;
window.jQuery = $;

const LandingPage = () => {
   const [auth, setAuth] = useState(false); // Add state for authentication
   const { setShowbot } = useContext(ChatbotContext);

   const [formData, setFormData] = useState({
     id_no: '',
     full_name: '',
     registerEmail: '',
     password: '',
     confirm_password: '',
     school: '',
     mobile_no: '',
     sex: '',
     strand: '',
     grade_level: ''
   });
   const [feedbackData, setFeedbackData] = useState({
       feedbackEmail: '',
       feedback: ''
   });

   const [showLoginModal, setShowLoginModal] = useState(false);
   const [showRegisterModal, setShowRegisterModal] = useState(false);

   const navlinks = [
      { text: 'Home', link: '/#home' },
      { text: 'Learn RIASEC', link: '/#learn-riasec' },
      { text: 'Feedback', link: '/#feedback' },
   ];
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
    
   const [inputs, setInputs] = useState({ feedbackEmail: '', feedback: '' });
   const { feedbackEmail, feedback } = inputs;

   const handleInputChange = e => {
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

      if (!formData.id_no || !formData.full_name || !formData.registerEmail || !formData.password || !formData.confirm_password) {
         toast.error('Please fill in all required fields');
         return;
      }

      const data = {
         id_no: formData.id_no,
         full_name: formData.full_name,
         email: formData.registerEmail,
         password: formData.password,
         confirm_password: formData.confirm_password,
         school: formData.school,
         mobile_no: formData.mobile_no,
         sex: formData.sex,
         strand: formData.strand,
         grade_level: formData.grade_level
      };

      console.log('Data to be sent:', data);

      try {
         const response = await axios.post('/auth/register/', data, {
            headers: {
               'Content-Type': 'application/json',
               'X-CSRFToken': getCookie('csrftoken')
            }
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
  
      console.log("Login Data:", loginData);
  
      try {
          const response = await axios.post(
              'http://localhost:8000/auth/token/', // Ensure this URL matches your Django URL configuration
              loginData,
              {
                  headers: {
                      'Content-Type': 'application/json',
                  },
              }
          );
  
          console.log("Login Response:", response);
          console.log("Login Response Data:", response.data);
  
          if (response.status === 200 && response.data.access) {
              setAuth(true);
              localStorage.setItem('authToken', response.data.access); // Store token if needed
              toast.success('Login successful!');
          } else {
              toast.error('Login failed. Please check your credentials.');
          }
      } catch (err) {
          console.error("Login Error:", err.response ? err.response.data : err.message);
          toast.error('Login failed. Please check your credentials.');
      }
  };
  

  const handleLogout = () => {
   localStorage.removeItem('authToken'); // Remove the token from localStorage
   setAuth(false);
   toast.success("Logged out successfully!");
 };

    const handleRegister = async (e) => {
    e.preventDefault();
    const csrftoken = getCookie('csrftoken');
    console.log("Form Data: ", formData); // Log form data to console for debugging

    try {
      const response = await axios.post(
        'http://localhost:8000/auth/register/',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
          }
        }
      );
      console.log(response.data);
      if (response.status === 201) {
        toast.success("User registered successfully");
        setShowRegisterModal(false); // Hide the modal
        setShowLoginModal(true); // Show the login modal
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error.response.data);
      toast.error(error.response.data.message);
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
         size='modal-lg' // Change the size to large
         show={showLoginModal}
         onHide={() => setShowLoginModal(false)}
         >
         <form onSubmit={handleLogin}>
            <div className='d-flex flex-column align-items-center'>
               <img src={anna} alt='Anna' className='mb-3' style={{ width: '200px', height: '200px' }} /> {/* Adjusted image size */}
               <h2 className='mb-3'>Sign In</h2>
            </div>
            <div className='mb-3 input-group'>
               <span className='input-group-text'><i className='fas fa-id-card'></i></span>
               <input type='email' className='form-control' id='loginEmail' required />            </div>
            <div className='mb-3 input-group'>
               <span className='input-group-text'><i className='fas fa-lock'></i></span>
               <input type='password' className='form-control' id='loginPassword' required />
               </div>
            <div className='d-flex justify-content-between w-100'>
               <div>
               <a href='#forgot-password' className='text-decoration-none'>Forgot Password?</a>
               </div>
            </div>
            <div className='d-flex justify-content-center mt-3'>
               <button className='btn btn-primary' data-bs-dismiss='modal'> Login </button>
            </div>
            <div className='text-center mt-3'>
               <small>Don't have an account? <button type="button" className='btn btn-link' onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }}>Sign Up</button></small>
            </div>
         </form>
         </Modal>


      <Modal
        title='Register'
        target='modal-register'
        size='modal-md'
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
      >
        <form onSubmit={handleRegister}>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-id-card'></i></span>
            <input type='text' className='form-control' id='id_no' placeholder='ID No.' value={formData.id_no} onChange={handleChange} required />
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-user'></i></span>
            <input type='text' className='form-control' id='full_name' placeholder='Full Name' value={formData.full_name} onChange={handleChange} required />
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-envelope'></i></span>
            <input type='email' className='form-control' id='registerEmail' placeholder='Email' value={formData.registerEmail} onChange={handleChange} required />
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-lock'></i></span>
            <input type='password' className='form-control' id='password' placeholder='Password' value={formData.password} onChange={handleChange} required />
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-lock'></i></span>
            <input type='password' className='form-control' id='confirm_password' placeholder='Confirm Password' value={formData.confirm_password} onChange={handleChange} required />
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-school'></i></span>
            <input type='text' className='form-control' id='school' placeholder='School' value={formData.school} onChange={handleChange} required />
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-phone'></i></span>
            <input type='text' className='form-control' id='mobile_no' placeholder='Mobile No.' value={formData.mobile_no} onChange={handleChange} required />
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-venus-mars'></i></span>
            <select className='form-control' id='sex' value={formData.sex} onChange={handleChange} required>
              <option value='' hidden>Sex</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
            </select>
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-graduation-cap'></i></span>
            <select className='form-control' id='strand' value={formData.strand} onChange={handleChange} required>
              <option value='' hidden>Strand</option>
              <option value='ABM'>ABM</option>
              <option value='ARTSDESIGN'>ARTS&DESIGN</option>
              <option value='STEM'>STEM</option>
              <option value='HUMMS'>HUMMS</option>
              <option value='TVL'>TVL</option>
            </select>
          </div>
          <div className='mb-3 input-group'>
            <span className='input-group-text'><i className='fas fa-level-up-alt'></i></span>
            <select className='form-control' id='grade_level' value={formData.grade_level} onChange={handleChange} required>
              <option value='' hidden>Grade Level</option>
              <option value='11'>Grade 11</option>
              <option value='12'>Grade 12</option>
            </select>
          </div>
          <div className="d-flex justify-content-center w-100">
            <button type='submit' className='btn btn-primary'>Register</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default LandingPage;
