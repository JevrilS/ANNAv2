import React, { useEffect, useState } from 'react';
import '../../styles/../styles/style.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as bootstrap from 'bootstrap';

function AccountDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_no: '',
    full_name: '',
    email: '',
    mobile_no: '',
    school: '',
    strand: '',
    sex: '',
    grade_level: ''
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No auth token found');
        }
        console.log('Fetching user data...');
        const response = await axios.get('/auth/user/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('User data fetched:', response.data);
        setFormData({
          id_no: response.data.id_no || '',
          full_name: response.data.full_name || '',
          email: response.data.email || '',
          mobile_no: response.data.mobile_no || '',
          school: response.data.school || '',
          strand: response.data.strand || '',
          sex: response.data.sex || '',
          grade_level: response.data.grade_level || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    console.log('Current Password:', currentPassword);
    console.log('New Password:', newPassword);
    console.log('Confirm New Password:', confirmNewPassword);

    try {
      const response = await axios.put(
        'http://localhost:8000/auth/change-password/',
        { currentPassword, newPassword, confirmNewPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Password updated successfully');

        // Close the modal and remove the backdrop
        const modal = document.getElementById('changePasswordModal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error.response ? error.response.data : error.message);
      toast.error(error.response && error.response.data ? error.response.data.message : 'Error updating password');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/auth/user/', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      console.log('User data updated successfully:', response.data);
      toast.success('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Failed to update user data');
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2 bg-warning vh-100 d-flex flex-column align-items-center py-4">
          <button className="btn btn-light mb-4" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <div className="nav flex-column nav-pills text-center w-100">
            <a className="nav-link active mb-3" href="#account">Account</a>
            <a className="nav-link" href="#result">Results</a>
          </div>
        </div>
        <div className="col-10">
          <div className="card mt-5 mx-3">
            <div className="card-body">
              <h5 className="card-title">Account Details</h5>
              <h6 className="card-subtitle mb-2 text-muted">Manage your Profile</h6>
              <form onSubmit={handleSubmit}>
                <div className="text-center my-3">
                  <div className="rounded-circle bg-secondary mx-auto" style={{ width: '100px', height: '100px' }}></div>
                  <p>ID: {formData.id_no}</p>
                  <button type="button" className="btn btn-warning">Upload</button>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="full_name" className="form-label">Full Name</label>
                    <input type="text" className="form-control" id="full_name" value={formData.full_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="grade_level" className="form-label">Grade Level</label>
                    <input type="text" className="form-control" id="grade_level" value={formData.grade_level} onChange={handleChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="mobile_no" className="form-label">Mobile No.</label>
                    <input type="text" className="form-control" id="mobile_no" value={formData.mobile_no} onChange={handleChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="school" className="form-label">School</label>
                    <input type="text" className="form-control" id="school" value={formData.school} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="strand" className="form-label">Strand</label>
                    <select className="form-select" id="strand" value={formData.strand} onChange={handleChange} required>
                      <option value="" hidden>Strand</option>
                      <option value="ABM">ABM</option>
                      <option value="ARTSDESIGN">ARTS&DESIGN</option>
                      <option value="STEM">STEM</option>
                      <option value="HUMMS">HUMMS</option>
                      <option value="TVL">TVL</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="sex" className="form-label">Sex</label>
                    <select className="form-select" id="sex" value={formData.sex} onChange={handleChange} required>
                      <option value="" hidden>Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex justify-content-center w-100">
                  <button type="submit" className="btn btn-warning w-100">Save</button>
                </div>
              </form>
              <div className="text-center mt-3">
                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Change Password Modal */}
    <div className="modal fade" id="changePasswordModal" tabIndex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="changePasswordModalLabel">Change Password</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                <input type="password" className="form-control" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input type="password" className="form-control" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-100">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default AccountDetails;