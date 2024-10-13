import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';  // Correct named import
import { isEmailValid } from '../../utils/validator';
import { UserContext } from '../../context/UserContext';

const GuidanceLogin = () => {
  const { setIsAuthenticated } = useContext(UserContext);  
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ email: '', password: '' });
  const { email, password } = inputs;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Function to check if the token is expired
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);  // Correct usage of jwtDecode
      const currentTime = Math.floor(Date.now() / 1000);  // Get current time in seconds
      console.log('Decoded Token Expiration Time:', decoded.exp, 'Current Time:', currentTime);
      return decoded.exp > currentTime;  // Token is valid if exp is greater than current time
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;  // Return false if decoding fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target.className += ' was-validated';

    // Check if fields are empty
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    if (!isEmailValid(email)) {
      toast.error('Invalid email format');
      return;
    }

    setIsSubmitting(true);

    try {
      const loginData = { email, password };

      // Send login request to backend
      const response = await fetch('http://localhost:8000/auth/guidance-login/', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log('Login response:', data);  // Debug: Check login response

      if (response.ok) {
        // Check if token is valid and handle accordingly
        if (data.access && isTokenValid(data.access)) {
          const decoded = jwtDecode(data.access);  // Use jwtDecode correctly (named import)
          console.log('Decoded Access Token:', decoded);  // Debug: Log decoded access token
          localStorage.setItem('access', data.access);
          localStorage.setItem('refresh', data.refresh);
          setIsAuthenticated(true);  // Mark user as authenticated
          toast.success('Login successful!');
          navigate('/admin/dashboard');  // Navigate to dashboard on success
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
      setIsSubmitting(false);  // Reset submitting state
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
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default GuidanceLogin;