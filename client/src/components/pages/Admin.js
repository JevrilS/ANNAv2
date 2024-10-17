// Admin.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Admin = ({ handleLogout }) => {
  console.log("Admin received handleLogout:", handleLogout); // Add this to verify if handleLogout is received

  return (
    <div className="d-flex">
      {/* Make sure `handleLogout` is passed to Navigation */}
      <Navigation handleLogout={handleLogout} />
      <div className="content-area flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
