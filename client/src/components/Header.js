import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from 'react-modal-state';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { UserContext } from '../context/UserContext'; // Import UserContext
import anna from '../assets/Anna_1.svg';

const Header = ({ navlinks, handleLogout }) => {
  const { isAuthenticated } = useContext(UserContext); // Access isAuthenticated from UserContext
  const { open: openLoginModal } = useModal('login'); // Use the modal hook for login

  useEffect(() => {
    const bootstrap = require('bootstrap');
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach(dropdownToggle => new bootstrap.Dropdown(dropdownToggle));
  }, []);

  return (
    <nav className='navbar navbar-expand-lg bg-white fixed-top'>
      <div className='container'>
        <a className='navbar-brand d-flex align-items-end' href='/#home'>
          <img className='anna-logo' src={anna} alt='anna-logo' />
          <h1 className='h3 ms-3 custom-heading text-primary'>Anna</h1>
        </a>
        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarSupportedContent'
          aria-controls='navbarSupportedContent'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarSupportedContent'>
          <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
            {navlinks.length > 0 &&
              navlinks.map((link, i) => (
                <li key={i} className='nav-item'>
                  <a className='nav-link' href={link.link}>
                    {link.text}
                  </a>
                </li>
              ))}
            {!isAuthenticated ? ( // Use isAuthenticated to conditionally render login/logout
              <li className="nav-item">
                <button
                  className="btn btn-primary fw-bold"
                  onClick={openLoginModal} // Open the login modal using the hook
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'background-color 0.3s ease, transform 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginLeft: '20px',
                    marginTop: '-8px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0056b3';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#007bff';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Login
                </button>
              </li>
            ) : (
              <li className='nav-item dropdown'>
                <a
                  className='nav-link dropdown-toggle'
                  href='#'
                  id='navbarDropdown'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  User
                </a>
                <ul className='dropdown-menu dropdown-menu-end' aria-labelledby='navbarDropdown'>
                  <li><Link className='dropdown-item' to='/account'>Account</Link></li>
                  <li><Link className='dropdown-item' to='/result'>Results</Link></li>
                  <li><button className='dropdown-item' onClick={handleLogout}>Logout</button></li>
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
