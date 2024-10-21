// ForgotPasswordModal.js
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useModalInstance } from 'react-modal-state'; // Correct import
import api from '../../utils/api';  // Your API utility
import { toast } from 'react-toastify';

const ForgotPasswordModal = () => {
  const { isOpen, close } = useModalInstance(); // Handles the current modal (ForgotPasswordModal)
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/request-password-reset/', { email });
      if (response.status === 200) {
        toast.success('Password reset email sent. Please check your inbox.');
        close();  // Close the modal after successful request
      } else {
        toast.error('Failed to send password reset email.');
      }
    } catch (error) {
      toast.error('Error: Unable to send password reset email.');
    }
  };

  return (
    <Modal show={isOpen} onHide={close} size="lg" dialogClassName="forgot-password-modal">
      <Modal.Header closeButton>
        <Modal.Title>Forgot Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-primary" type="submit">
              Send Reset Email
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;
