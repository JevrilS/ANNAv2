import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap
import Anna1 from '../../assets/Anna_1.svg';  // Import the image from your assets

const GuidanceLogin = () => {
   const [admin, setAdmin] = useState('');
   const [password, setPassword] = useState('');
   const navigate = useNavigate();
   
   // Function to handle login
   const handleLogin = async (e) => {
      e.preventDefault();

      try {
         // Send login request to Django backend
         const response = await fetch('/auth/guidance-login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin, password }),
         });

         const data = await response.json();

         if (response.ok) {
            localStorage.setItem('token', data.access);  // Store access token
            localStorage.setItem('refreshToken', data.refresh);  // Store refresh token
            console.log('Access Token:', localStorage.getItem('token'));  // Log access token
            console.log('Refresh Token:', localStorage.getItem('refreshToken'));  // Log refresh token
            toast.success('Login successful!');
            navigate('/admin/dashboard');  // Navigate to the dashboard
        } else {
            toast.error(data.error || 'Invalid credentials');
        }
      } catch (err) {
         toast.error('Server error. Please try again later');
         console.error(err.message);
      }
   };

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
                     <label htmlFor="admin" className="form-label">Admin</label>
                     <input
                        type="text"
                        className="form-control"
                        id="admin"
                        placeholder="Admin"
                        value={admin}
                        onChange={(e) => setAdmin(e.target.value)}
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
                        required
                     />
                  </div>
                  <button type="submit" className="btn btn-warning btn-block w-100">Login</button>
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
