import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';
import anna from '../assets/Anna_1.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Header = ({ navlinks, auth, handleLogout }) => {
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
                  <a className='nav-link' href={link.link} data-bs-toggle={link.isModal ? 'modal' : ''} data-bs-target={link.isModal ? link.link : ''}>
                    {link.text}
                  </a>
                </li>
              ))}
            {!auth ? (
              <>
                <li className='nav-item'>
                  <a className='nav-link' href='#modal-login' data-bs-toggle='modal' data-bs-target='#modal-login'>
                    Login
                  </a>
                </li>
                <li className='nav-item'>
                  <a className='nav-link' href='#modal-register' data-bs-toggle='modal' data-bs-target='#modal-register'>
                    Register
                  </a>
                </li>
              </>
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
                  <li><Link className='dropdown-item' to='/result'>Result</Link></li>
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
