import React, { useContext, useState, useEffect } from 'react';
import { useModalInstance } from 'react-modal-state';
import { Modal } from 'react-bootstrap';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/RegisterModal.css';

const RegisterModal = () => {
  const { isOpen, close } = useModalInstance();
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
    birthday: '',
    strand: '',
    grade_level: '',
    section_id: ''
  });
  const [schools, setSchools] = useState([]);
  const [sections, setSections] = useState([]);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [birthdayError, setBirthdayError] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await api.get('/schools/');
        setSchools(response.data);
      } catch (error) {
        toast.error('Failed to fetch schools');
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (formData.school_id) {
      const fetchSections = async () => {
        try {
          const response = await api.get(`/sections/?school_id=${formData.school_id}`);
          setSections(response.data);
        } catch (error) {
          toast.error('Failed to fetch sections');
        }
      };
      fetchSections();
    } else {
      setSections([]);
    }
  }, [formData.school_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Password validation
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  // Mobile number validation
  const isValidMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10,15}$/;
    return mobileRegex.test(mobile);
  };
  const handleBirthdayChange = (e) => {
    const birthday = e.target.value;
    setFormData({ ...formData, birthday });
  
    // Validate birthday as the user changes the input
    if (!isValidBirthday(birthday)) {
      const birthDate = new Date(birthday);
      if (birthDate > new Date()) {
        setBirthdayError('Birthday cannot be in the future.');
      } else {
        setBirthdayError('Age must be between 10 and 100.');
      }
    } else {
      setBirthdayError('');
    }
  };
  
  // Birthday validation
  const isValidBirthday = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    // Check if the birthday is in the future
    if (birthDate > today) {
      return false; // Invalid if the birthday is in the future
    }
  
    // Check if age is within the valid range
    return age >= 10 && age <= 100;
  };

  // Real-time validation for password
  const handlePasswordBlur = () => {
    if (!isValidPassword(formData.password)) {
      setPasswordError('Password must include uppercase, lowercase, number, and special character.');
    } else {
      setPasswordError('');
    }
  };

  // Real-time validation for confirm password
  const handleConfirmPasswordBlur = () => {
    if (formData.password !== formData.confirm_password) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Real-time validation for mobile
  const handleMobileBlur = () => {
    if (!isValidMobile(formData.mobile_no)) {
      setMobileError('Please enter a valid mobile number (10-15 digits).');
    } else {
      setMobileError('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Password validation feedback
    if (!isValidPassword(formData.password)) {
      setPasswordError('Password must include uppercase, lowercase, number, and special character.');
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirm_password) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    if (!isValidBirthday(formData.birthday)) {
      const birthDate = new Date(formData.birthday);
      if (birthDate > new Date()) {
        toast.error('Birthday cannot be in the future.');
      } else {
        toast.error('Please enter a valid birthday. Age must be between 10 and 100.');
      }
      return;
    }
    


    // Check mobile number
    if (!isValidMobile(formData.mobile_no)) {
      setMobileError('Please enter a valid mobile number (10-15 digits).');
      return;
    }

    const registerData = {
      id_no: formData.id_no,
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      school_id: formData.school_id,
      mobile_no: formData.mobile_no,
      sex: formData.sex,
      birthday: formData.birthday,
      strand: formData.strand.toUpperCase(),
      grade_level: formData.grade_level,
      section_id: formData.section_id
    };

    try {
      const response = await api.post('/register/', registerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setShowVerificationMessage(true);
        toast.success('Registration successful! A verification email has been sent.');
        setTimeout(() => {
          // Reset form after successful registration
          setFormData({
            id_no: '',
            full_name: '',
            email: '',
            password: '',
            confirm_password: '',
            school_id: '',
            mobile_no: '',
            sex: '',
            birthday: '',
            strand: '',
            grade_level: '',
            section_id: ''
          });
          close();
          openLoginModal();
        }, 3000);
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
        {showVerificationMessage && (
          <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16" style={{ animation: 'check-animation 0.5s ease' }}>
              <path d="M16 8a8 8 0 1 1-16 0 8 8 0 0 1 16 0zM4.5 8.5L7 11l4.5-4.5-1-1L7 9l-2.5-2.5-1 1z" />
            </svg>
            <div>Verification Email has been sent!</div>
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form">
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
              onBlur={handlePasswordBlur}
              onChange={handleChange}
              required
            />
            {passwordError && <small className="text-danger">{passwordError}</small>}
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
              onBlur={handleConfirmPasswordBlur}
              onChange={handleChange}
              required
            />
            {confirmPasswordError && <small className="text-danger">{confirmPasswordError}</small>}
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
              onBlur={handleMobileBlur}
              onChange={handleChange}
              required
            />
            {mobileError && <small className="text-danger">{mobileError}</small>}
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
              type="date"
              className="form-control"
              id="birthday"
              placeholder="Birthday"
              value={formData.birthday}
              onChange={handleBirthdayChange} // Updated to use the new function
              required
            />
            {birthdayError && <small className="text-danger">{birthdayError}</small>}
          </div>
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
            {/* Select Section */}
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fas fa-users"></i>
              </span>
              <select
                className="form-control"
                id="section_id"
                value={formData.section_id}
                onChange={handleChange}
                required
                disabled={!formData.school_id} // Disable if no school is selected
              >
                <option value="" hidden>
                  Select Section
                </option>
                {sections.length > 0 ? (
                  sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No sections available</option>
                )}
              </select>
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
