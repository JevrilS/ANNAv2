import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';  // Import jwtDecode as named import
import { isEmailValid } from '../../utils/validator';
import { UserContext } from '../../context/UserContext';  // Import UserContext

const GuidanceLogin = () => {
  const { setIsAuthenticated } = useContext(UserContext);  // Use setIsAuthenticated from UserContext
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ email: '', password: '' });
  const { email, password } = inputs;
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  // Handle input changes and update the state
  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Function to check if the token is expired
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds
      return decoded.exp > currentTime; // Return true if token is still valid
    } catch (error) {
      return false; // If any error occurs, the token is considered invalid
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target.className += ' was-validated';
  
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
  
    if (!isEmailValid(email)) {
      toast.error('Invalid email format');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const loginData = { email, password };
  
      const response = await fetch('/auth/guidance-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
  
      const data = await response.json();
      console.log('Login response:', data);  // Debugging: Print response to check tokens
  
      if (response.ok) {
        if (data.access && isTokenValid(data.access)) {
          console.log('Decoded Access Token:', jwtDecode(data.access));  // Debugging: Check decoded token
          localStorage.setItem('access', data.access);
          localStorage.setItem('refresh', data.refresh);
          setIsAuthenticated(true);
          toast.success('Login successful!');
          navigate('/admin/dashboard');
        } else {
          toast.error('Access token is invalid or expired');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className='d-flex justify-content-center align-items-center vh-100 bg-light'>
      <div className='container' style={{ maxWidth: '400px' }}>
        <form className='needs-validation' noValidate onSubmit={handleSubmit}>
          <h1 className='custom-heading mb-5 text-center'>Guidance Login</h1>

          <div className='form-group mb-4'>
            <label htmlFor='email' className='form-label'>Email</label>
            <input
              className={`form-control ${!email ? 'is-invalid' : ''}`}
              value={email}
              type='email'
              id='email'
              name='email'
              required
              placeholder='Enter your email'
              onChange={handleInputChange}
            />
            <div className='invalid-feedback'>Email can't be empty</div>
          </div>

          <div className='form-group mb-4'>
            <label htmlFor='password' className='form-label'>Password</label>
            <input
              className={`form-control ${!password ? 'is-invalid' : ''}`}
              value={password}
              type='password'
              id='password'
              name='password'
              required
              placeholder='Enter your password'
              onChange={handleInputChange}
            />
            <div className='invalid-feedback'>Password can't be empty</div>
          </div>

          <button className='btn btn-primary w-100' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'} {/* Show loading state */}
          </button>
        </form>
      </div>
    </section>
  );
};

export default GuidanceLogin;
