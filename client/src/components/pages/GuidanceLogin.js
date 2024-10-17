import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap
import Anna1 from '../../assets/Anna_1.svg';  // Import the image from your assets

const GuidanceLogin = () => {
  const [admin, setAdmin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  // New state for loading
  const navigate = useNavigate();
  const isMounted = useRef(true);  // Use ref to track mounted status
  
  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    setLoading(true);  // Start loading
    
    try {
      const response = await fetch('/auth/guidance-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin, password }),
      });

      const data = await response.json();

      if (isMounted.current && response.ok && data.access && data.refresh) {
        // Store tokens only if they exist
        localStorage.setItem('token', data.access);  
        localStorage.setItem('refreshToken', data.refresh);  
        console.log('Access Token:', data.access); 
        console.log('Refresh Token:', data.refresh);
        toast.success('Login successful!');
        
        // Force a redirect to dashboard after successful login
        window.location.replace('/admin/dashboard');
        
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
        setLoading(false);  // Stop loading
      }
    }
  };

  // Cleanup function to avoid state updates on an unmounted component
  useEffect(() => {
    // When the component is mounted, set isMounted to true
    isMounted.current = true;
    
    // Cleanup function: when the component unmounts, set isMounted to false
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
              {loading ? 'Logging in...' : 'Login'}
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
