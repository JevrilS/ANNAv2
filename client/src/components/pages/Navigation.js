// Navigation.js
import React, { useState } from 'react';
import { Col, Nav, Button } from 'react-bootstrap';
import { FaHome, FaCommentDots, FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const navigate = useNavigate();

  return (
    <Col
      xs="auto"
      className="bg-warning vh-100"
      style={{
        width: isSidebarCollapsed ? '80px' : '200px',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginTop: '20px' }}>
        <Button
          variant="link"
          className="text-white"
          onClick={toggleSidebar}
          style={{ marginBottom: '20px' }}
        >
          <span className="navbar-toggler-icon"></span>
        </Button>

        <Nav className="flex-column text-center">
          <Nav.Item className="mb-2">
            <Nav.Link
              onClick={() => navigate('/admin/dashboard')}
              className="text-white fw-bold d-flex align-items-center justify-content-center"
              style={{
                flexDirection: isSidebarCollapsed ? 'column' : 'row',
                transition: 'all 0.3s ease',
                fontSize: isSidebarCollapsed ? '0.8rem' : '1rem',
                color: 'white',
              }}
            >
              <FaHome className="me-2" size={isSidebarCollapsed ? 25 : 20} />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="mb-2">
            <Nav.Link
              onClick={() => navigate('/admin/conversation')}
              className="text-white fw-bold d-flex align-items-center justify-content-center"
              style={{
                flexDirection: isSidebarCollapsed ? 'column' : 'row',
                transition: 'all 0.3s ease',
                fontSize: isSidebarCollapsed ? '0.8rem' : '1rem',
                color: 'white',
              }}
            >
              <FaClipboardList className="me-2" size={isSidebarCollapsed ? 25 : 20} />
              {!isSidebarCollapsed && <span>Conversations</span>}
            </Nav.Link>
          </Nav.Item>

          <Nav.Item className="mb-2">
            <Nav.Link
              onClick={() => navigate('/admin/feedback')}
              className="text-white fw-bold d-flex align-items-center justify-content-center"
              style={{
                flexDirection: isSidebarCollapsed ? 'column' : 'row',
                transition: 'all 0.3s ease',
                fontSize: isSidebarCollapsed ? '0.8rem' : '1rem',
                color: 'white',
              }}
            >
              <FaCommentDots className="me-2" size={isSidebarCollapsed ? 25 : 20} />
              {!isSidebarCollapsed && <span>Feedback</span>}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </Col>
  );
};

export default Navigation;
