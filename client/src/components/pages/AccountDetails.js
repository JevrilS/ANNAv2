import React, { useEffect, useState } from 'react';
import '../../styles/style.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { toast } from 'react-toastify';
import * as bootstrap from 'bootstrap';
import api from '../../utils/api'; // Import the Axios instance

function AccountDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_no: '',
    full_name: '',
    email: '',
    mobile_no: '',
    school_id: '',
    strand: '',
    sex: '',
    grade_level: '',
  });
  const [schools, setSchools] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Check if passwords match
  useEffect(() => {
    setPasswordsMatch(newPassword === confirmNewPassword);
  }, [newPassword, confirmNewPassword]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No auth token found');
        }
  
        const response = await api.get('/auth/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log('User Data:', response.data); // Check this log
  
        setFormData({
          id_no: response.data.id_no || '',
          full_name: response.data.full_name || '',
          email: response.data.email || '',
          mobile_no: response.data.mobile_no || '',
          school_id: String(response.data.school_id) || '', // Ensure it's a string
          strand: response.data.strand || '',
          sex: response.data.sex || '',
          grade_level: response.data.grade_level || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error.response ? error.response.data : error.message);
        if (error.response) {
          console.log('Response Status:', error.response.status);
          console.log('Response Headers:', error.response.headers);
        }
        toast.error('Failed to fetch user data');
        if (error.response && error.response.status === 401) {
          toast.error('You are not authorized. Please log in again.');
          navigate('/login'); // Redirect to login if unauthorized
        }
      }
    };
  
    fetchUserData();
  }, [navigate]);
  // Fetch schools
 // Fetch schools
 useEffect(() => {
  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await api.get('/auth/schools/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Schools Data:', response.data); // Verify the data

      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error.response ? error.response.data : error.message);
      if (error.response) {
        console.log('Response Status:', error.response.status);
        console.log('Response Headers:', error.response.headers);
      }
      toast.error('Failed to fetch schools');
      if (error.response && error.response.status === 401) {
        toast.error('You are not authorized. Please log in again.');
        navigate('/login'); // Redirect to login if unauthorized
      }
    }
  };

  fetchSchools();
}, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      toast.error('New passwords do not match!');
      return;
    }

    try {
      const response = await api.put(
        'auth/change-password/',
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_new_password: confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Password updated successfully');
        const modal = document.getElementById('changePasswordModal');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Invalid request data');
      } else if (error.response && error.response.status === 401) {
        toast.error('Incorrect current password. Please try again.');
      } else {
        toast.error(error.response && error.response.data ? error.response.data.message : 'Error updating password');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('auth/user/', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.status === 200) {
        toast.success('Account details updated successfully');
      } else {
        toast.error('Failed to update account details');
      }
    } catch (error) {
      console.error('Error updating account details:', error.response ? error.response.data : error.message);
      toast.error('Error updating account details');
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
          <div className="card mt-5 mx-auto" style={{ width: '80%' }}>
            <div className="card-body">
              <h5 className="card-title">Account Details</h5>
              <h6 className="card-subtitle mb-4 text-muted">Manage your Profile</h6>
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <div className="rounded-circle bg-secondary mx-auto mb-3" style={{ width: '150px', height: '150px' }}></div>
                  <p>ID: {formData.id_no}</p>
                  <button type="button" className="btn btn-warning w-75 mx-auto">Upload</button>
                </div>
                <div className="col-md-8">
                  <form onSubmit={handleSubmit}>
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
                        <label htmlFor="school_id" className="form-label">School</label>
                        <select
  className="form-select"
  id="school_id"
  value={formData.school_id} // Correctly bind the value
  onChange={handleChange}
>
  <option value="" hidden>Select School</option>
  {schools.map((school) => (
    <option key={school.id} value={school.id}>
      {school.school_des}
    </option>
  ))}
</select>
                      </div>
                      <div className="col-md-6 mb-3">
                      <label htmlFor="strand" className="form-label">Strand</label>
                      <select className="form-select" id="strand" value={formData.strand} onChange={handleChange} required>
                        <option value="" hidden>Strand</option>
                        <option value="ABM">ABM</option>
                        <option value="ARTSDESIGN">ARTS&DESIGN</option>
                        <option value="STEM">STEM</option>
                        <option value="HUMSS">HUMSS</option>
                        <option value="TVL - Information and Communications Technology">TVL - Information and Communications Technology</option>
                        <option value="TVL - Home Economics">TVL - Home Economics</option>
                        <option value="TVL - Agri-Fishery Arts">TVL - Agri-Fishery Arts</option>
                        <option value="TVL - Industrial Arts">TVL - Industrial Arts</option>
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
                      <button type="submit" className="btn btn-warning w-50">Save</button>
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
        </div>
      </div>

      {/* Change Password Modal */}
      <div className="modal fade" id="changePasswordModal" tabIndex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
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
                  {!passwordsMatch && <div className="text-danger">Passwords do not match</div>}
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
