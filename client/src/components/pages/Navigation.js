import React, { useState, useContext } from 'react';
import { Col, Nav, Button } from 'react-bootstrap';
import { FaHome, FaCommentDots, FaClipboardList, FaSignOutAlt, FaTasks } from 'react-icons/fa'; // Import FaTasks for Management section
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext'; // Import the UserContext

const Navigation = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { setIsAuthenticated } = useContext(UserContext); // Get setIsAuthenticated to manage auth state
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    // Clear the authentication tokens
    localStorage.removeItem('authToken');  // Update to remove 'authToken'
    localStorage.removeItem('refreshToken');
    // Set authentication state to false
    setIsAuthenticated(false);
    // Navigate to login page
    navigate('/admin/login');
  };
  
  const toggleSidebar = () => setIsSidebarCollapsed((prevState) => !prevState);

  const handleNavigation = (path) => {
    const token = localStorage.getItem('authToken');  // Fix token name here
    if (!token) {
      console.warn('No token found, redirecting to login.');
      handleLogout();  // If no token is found, log out the user
    } else {
      console.log('Token exists, navigating to:', path);
      navigate(path); // Otherwise, navigate to the selected path
    }
  };
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/conversation', label: 'Conversations', icon: <FaClipboardList /> },
    { path: '/admin/feedback', label: 'Feedback', icon: <FaCommentDots /> },
    { path: '/admin/management', label: 'Management', icon: <FaTasks /> }, // Management section added
  ];

  // Custom NavItem component to avoid repetition
  const NavItem = ({ path, label, icon }) => (
    <Nav.Item className="mb-3">
      <Nav.Link
        onClick={() => handleNavigation(path)}  // Call handleNavigation instead of navigate directly
        className="text-white fw-bold d-flex align-items-center"
        style={{
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          textAlign: isSidebarCollapsed ? 'center' : 'left',
          flexDirection: 'row',
          transition: 'all 0.3s ease',
          fontSize: '1rem',
          padding: '10px 15px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'white';
          e.currentTarget.querySelector('svg').style.fill = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '';
          e.currentTarget.querySelector('svg').style.fill = '';
        }}
      >
        <span
          style={{
            minWidth: '30px', // Ensure icons are aligned with text
            textAlign: 'center',
          }}
        >
          {React.cloneElement(icon, { size: isSidebarCollapsed ? 30 : 20 })}
        </span>
        {!isSidebarCollapsed && <span className="ms-2">{label}</span>}
      </Nav.Link>
    </Nav.Item>
  );

  return (
    <Col
      xs="auto"
      className="bg-warning d-flex flex-column"
      style={{
        width: isSidebarCollapsed ? '80px' : '200px',
        transition: 'width 0.3s ease',
        overflowY: 'auto',  // Add this line for vertical scrolling
        overflowX: 'hidden', // Prevent horizontal scroll
        minHeight: '100vh',  // Ensure the sidebar stretches to full viewport height
        paddingBottom: '20px', // Ensure space at the bottom
      }}
    >
      {/* Toggle Button */}
      <Button
        variant="link"
        className="text-white align-self-center"
        onClick={toggleSidebar}
        style={{ marginTop: '20px', marginBottom: '40px' }} // Extra space after the toggle button
      >
        <span className="navbar-toggler-icon"></span>
      </Button>

      {/* Nav items */}
      <Nav className="flex-column" style={{ marginTop: '20px' }}>
        {navItems.map((item) => (
          <NavItem key={item.path} path={item.path} label={item.label} icon={item.icon} />
        ))}
      </Nav>

      {/* Logout Button */}
      <Nav.Item className="mt-auto mb-4">
        <Button
          variant="danger"
          className="fw-bold d-flex align-items-center"
          onClick={handleLogout} // Trigger handleLogout
          style={{
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            fontSize: '0.9rem', // Adjust font size
            padding: '10px 15px',
            width: '100%',
          }}
        >
          <span
            style={{
              minWidth: '30px',
              textAlign: 'center',
            }}
          >
            <FaSignOutAlt size={isSidebarCollapsed ? 25 : 20} />
          </span>
          {!isSidebarCollapsed && <span className="ms-2">Logout</span>}
        </Button>
      </Nav.Item>
    </Col>
  );
};

export default Navigation;
