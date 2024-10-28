import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from 'react-modal-state';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { UserContext } from '../context/UserContext'; // Import UserContext
import anna from '../assets/Anna_1.svg';
import api from '../utils/api'; // Assuming you have an Axios instance set up

const Header = ({ navlinks, handleLogout }) => {
  const { isAuthenticated } = useContext(UserContext); // Access isAuthenticated from UserContext
  const { open: openLoginModal } = useModal('login'); // Use the modal hook for login
  const [userName, setUserName] = useState(''); // State to store the user's name
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); // State to track if the navbar is open or closed

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await api.get('/auth/user/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserName(response.data.full_name); // Set the user's full name from the response
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('User'); // Fallback in case of error
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]); // Fetch user data only if authenticated

  // Function to handle the manual toggle of the navbar
  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen); // Toggle the navbar state
  };

  // Close the navbar when a link is clicked or logout is triggered, except for dropdown links
  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="/#home">
          <img className="anna-logo" src={anna} alt="anna-logo" style={{ width: '40px', height: '40px' }} />
          <h1 className="h3 ms-2 custom-heading text-primary mb-0">Anna</h1>
        </a>
        <button
          className={`navbar-toggler ${isNavbarOpen ? '' : 'collapsed'}`} // Handle the open/close state
          type="button"
          onClick={toggleNavbar} // Call the toggle function
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded={isNavbarOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isNavbarOpen ? 'show' : ''}`} id="navbarSupportedContent"> {/* Manually control the navbar collapse */}
          <ul className="navbar-nav ms-auto align-items-center text-center">
            {navlinks.length > 0 &&
              navlinks.map((link, i) => (
                <li key={i} className="nav-item">
                  <a className="nav-link" href={link.link} onClick={closeNavbar}> {/* Close the navbar when a link is clicked */}
                    {link.text}
                  </a>
                </li>
              ))}
            {!isAuthenticated ? (
              <li className="nav-item d-flex justify-content-center align-items-center">
                <button
                  className="btn btn-primary fw-bold"
                  onClick={() => { openLoginModal(); closeNavbar(); }} // Open login modal and close navbar
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Login
                </button>
              </li>
            ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {userName || 'User'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <Link className="dropdown-item" to="/account" onClick={closeNavbar}> {/* Close navbar when navigating */}
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/result" onClick={closeNavbar}> {/* Close navbar when navigating */}
                      Results
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => { handleLogout(); closeNavbar(); }}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
