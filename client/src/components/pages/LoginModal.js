import React, { useContext } from 'react';
import { useModalInstance, useModal } from 'react-modal-state'; // Correct import
import { Modal } from 'react-bootstrap';
import anna from '../../assets/Anna_1.svg';
import api from '../../utils/api';
import { UserContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginModal = () => {
  const { isOpen, close } = useModalInstance(); // Handles the current modal (LoginModal)
  const { setIsAuthenticated } = useContext(UserContext);
  const { open: openRegisterModal } = useModal('register'); // Destructure the open function from useModal

  const handleLogin = async (e) => {
    e.preventDefault();
  
    const loginData = {
      email: e.target.loginEmail.value,
      password: e.target.loginPassword.value,
    };
  
    try {
      const response = await api.post('/auth/token/', loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Log the full API response for debugging
      console.log('API response:', response.data);
  
      // Check if the response is successful
      if (response.status === 200) {
        // Check if the user's account is active
        if (!response.data.is_active) {  // Ensure your API returns is_active in the response
          toast.warn('Please verify your account by clicking on the verification link sent to your email.');
          return; // Exit early if the account is not active
        }
  
        // Set authenticated state and store tokens
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
  
        toast.success('Login successful!');
        window.location.reload();
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (err) {
      // Log the error for debugging
      console.error('Login error:', err);
  
      // Check for specific error responses to differentiate between errors
      if (err.response && err.response.status === 403) {
        toast.warn('Your account is not verified. Please check your email for the verification link.');
      } else if (err.response && err.response.data.detail) {
        toast.error(`Login failed: ${err.response.data.detail}`); // Display detailed error message from the backend
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    }
  };
  

  const handleSignUp = () => {
    close(); // Close the LoginModal
    setTimeout(() => {
      openRegisterModal(); // Use the correct function to open RegisterModal
    }, 300); // Delay for smooth transition
  };

  return (
    <Modal show={isOpen} onHide={close} size="lg" dialogClassName="login-modal">
      <Modal.Header closeButton>
        <Modal.Title>Sign In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleLogin} className="login-form">
          <div className="d-flex flex-column align-items-center">
            <img src={anna} alt="Anna" className="mb-3" style={{ width: '150px', height: '150px' }} />
            <h2 className="mb-3 modal-title">Sign In</h2>
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              className="form-control"
              id="loginEmail"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="fas fa-lock"></i>
            </span>
            <input
              type="password"
              className="form-control"
              id="loginPassword"
              placeholder="Password"
              required
            />
          </div>
          <div className="d-flex justify-content-center w-100">
            <a href="#changePasswordModal" className="forgot-password-link">
              Forgot Password?
            </a>
          </div>
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </div>
          <div className="text-center mt-3 dont-have-account">
            <span>
              Don't have an account?
              <button
                type="button"
                className="btn btn-link signup-button"
                onClick={handleSignUp} // Call the handleSignUp function to transition to RegisterModal
              >
                Sign Up
              </button>
            </span>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
