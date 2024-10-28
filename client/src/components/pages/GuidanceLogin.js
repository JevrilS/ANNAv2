import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap
import Anna1 from '../../assets/Anna_1.svg';  // Import the image from your assets
import api from '../../utils/api';  // Import the API utility
import { UserContext } from '../../context/UserContext';  // Import UserContext to manage auth state

const GuidanceLogin = () => {
  const [admin, setAdmin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  // State for loading
  const navigate = useNavigate();
  const isMounted = useRef(true);  // Use ref to track mounted status
  const { setIsAuthenticated } = useContext(UserContext);  // Get setIsAuthenticated from UserContext
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    setLoading(true);  // Set loading to true at the start of the login process
    
    try {
      const response = await api.post('/auth/guidance-login/', {
        admin,
        password,
      });

      const data = response.data;

      if (isMounted.current && response.status === 200 && data.access && data.refresh) {
        // Store tokens using 'authToken' and 'refreshToken'
        localStorage.setItem('authToken', data.access);  
        localStorage.setItem('refreshToken', data.refresh);  
        
        console.log('Access Token:', data.access); 
        console.log('Refresh Token:', data.refresh);
        toast.success('Login successful!');
        
        // Update isAuthenticated state to trigger re-render
        setIsAuthenticated(true);
        
        console.log('Navigating to dashboard');
        // Use navigate to redirect after login
        navigate('/admin/dashboard', { replace: true });
        
      } else if (isMounted.current) {
        // If response isn't ok or tokens don't exist, show error
        console.error('Login error: ', data);
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Server error: ', err);
        toast.error('Server error. Please try again later');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);  // Set loading to false at the end of the login process
      }
    }
  };

  // Cleanup function to avoid state updates on an unmounted component
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Main login content */}
      <div className="container my-auto d-flex justify-content-center align-items-center">
        <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
          <div className="text-center">
            <div className="d-flex justify-content-center mb-3">
              <img src={Anna1} alt="Anna avatar" className="img-fluid rounded-circle" style={{ width: '150px' }} />
            </div>
            <h2 className="mb-4">Sign In</h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label htmlFor="admin" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter Your email"
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
                disabled={loading}  // Disable input when loading
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}  // Disable input when loading
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-warning btn-block w-100"
              disabled={loading}  // Disable button when loading
            >
              {loading ? 'Logging in...' : 'Login'}  {/* Show loading state */}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-2 bg-warning text-center">
        <div className="container">
          <p className="mb-0">ANNA | Copyright © 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default GuidanceLogin;
