import React, { useContext, useState, useEffect } from 'react';
import { useModalInstance } from 'react-modal-state';
import { Modal } from 'react-bootstrap';
import api from '../../utils/api'; // Ensure this matches your structure
import { UserContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/RegisterModal.css'; // Import the CSS file for styling

const RegisterModal = () => {
  const { isOpen, close } = useModalInstance();
  const { setIsAuthenticated } = useContext(UserContext);
  const { open: openLoginModal } = useModalInstance();
  const [formData, setFormData] = useState({
    id_no: '',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    school_id: '',
    mobile_no: '',
    sex: '',
    age: '',
    strand: '',
    grade_level: '',
  });
  const [schools, setSchools] = useState([]);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false); // State for verification message

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await api.get('/schools/');
        setSchools(response.data);
      } catch (error) {
        console.error('Error fetching schools:', error);
        toast.error('Failed to fetch schools');
      }
    };

    fetchSchools();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const registerData = {
      id_no: formData.id_no,
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      school_id: formData.school_id,
      mobile_no: formData.mobile_no,
      sex: formData.sex,
      age: formData.age,
      strand: formData.strand.toUpperCase(),
      grade_level: formData.grade_level,
    };

    try {
      const response = await api.post('/register/', registerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setShowVerificationMessage(true); // Show the verification message
        toast.success('Registration successful! A verification email has been sent.');
        setTimeout(() => {
          close();
          openLoginModal(); // Optional: Open login modal after successful registration
        }, 3000); // Close the modal after 3 seconds
      } else {
        toast.error(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      toast.error('Registration failed. Please check your details.');
    }
  };

  return (
    <Modal show={isOpen} onHide={close} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Register</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Verification Message Box */}
        {showVerificationMessage && (
          <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-check-circle-fill me-2"
              viewBox="0 0 16 16"
              style={{ animation: 'check-animation 0.5s ease' }}
            >
              <path d="M16 8a8 8 0 1 1-16 0 8 8 0 0 1 16 0zM4.5 8.5L7 11l4.5-4.5-1-1L7 9l-2.5-2.5-1 1z" />
            </svg>
            <div>Verification Email has been sent!</div>
          </div>
        )}
        <form onSubmit={handleRegister} className="register-form">
          <div className="mb-3">
            <h4 className="text-center">Register</h4>
          </div>

          {/* ID No */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-id-card"></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="id_no"
              placeholder="ID No."
              value={formData.id_no}
              onChange={handleChange}
              required
            />
          </div>

          {/* Full Name */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-user"></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-key"></i>
            </span>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-key"></i>
            </span>
            <input
              type="password"
              className="form-control"
              id="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Select School */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-school"></i>
            </span>
            <select
              className="form-control"
              id="school_id"
              value={formData.school_id}
              onChange={handleChange}
              required
            >
              <option value="" hidden>
                Select School
              </option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.school_des}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile No */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-phone"></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="mobile_no"
              placeholder="Mobile No."
              value={formData.mobile_no}
              onChange={handleChange}
              required
            />
          </div>

          {/* Sex and Age (side by side) */}
          <div className="row">
            <div className="col-6 mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-venus-mars"></i>
              </span>
              <select
                className="form-control"
                id="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="" hidden>
                  Sex
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="col-6 mb-3 input-group">
              <span className="input-group-text">
                <i className="fas fa-birthday-cake"></i>
              </span>
              <input
                type="number"
                className="form-control"
                id="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Strand */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-graduation-cap"></i>
            </span>
            <select
              className="form-control"
              id="strand"
              value={formData.strand}
              onChange={handleChange}
              required
            >
              <option value="" hidden>
                Strand
              </option>
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

          {/* Grade Level */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="fas fa-level-up-alt"></i>
            </span>
            <select
              className="form-control"
              id="grade_level"
              value={formData.grade_level}
              onChange={handleChange}
              required
            >
              <option value="" hidden>
                Grade Level
              </option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>

          {/* Register Button */}
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Register
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal;
