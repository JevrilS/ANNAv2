// Admin.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation'; // Import the sidebar navigation

const Admin = () => {
  return (
    <div className="d-flex">
      {/* Render the Navigation component */}
      <Navigation />
      {/* Outlet for nested routes like dashboard, conversation, feedback */}
      <div className="content-area flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
