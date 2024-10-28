import React, { useState, useEffect, useContext } from 'react';
import { Table, Container, Alert, Spinner } from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleLogout } = useContext(UserContext);
  const navigate = useNavigate();

  // Fetch feedbacks using fetch API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // If no token, log out and redirect
        if (!token) {
          handleLogout();
          navigate('/admin/login');
          return;
        }

        const response = await fetch('https://django-backend-604521917673.asia-northeast1.run.app/api/feedbacks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Check if token has expired (401 status), try to refresh
        if (response.status === 401) {
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            const refreshedResponse = await fetch('https://django-backend-604521917673.asia-northeast1.run.app/api/feedbacks', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
              },
            });
            processFeedbackResponse(refreshedResponse);
          } else {
            handleLogout();
          }
        } else {
          processFeedbackResponse(response);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast.error('Failed to fetch feedback');
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [handleLogout, navigate]);

  const processFeedbackResponse = async (response) => {
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.feedbacks)) {
        setFeedbackList(data.feedbacks);
      } else {
        console.error('Unexpected response structure:', data);
      }
    } else {
      console.error('Failed to fetch feedback:', response.status);
    }
    setLoading(false);
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await fetch('/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.access);
        return data.access;
      } else {
        console.error('Failed to refresh access token');
        handleLogout();
        return null;
      }
    } catch (err) {
      console.error('Error refreshing access token:', err);
      handleLogout();
      return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        <p>Loading feedback...</p>
      </div>
    );
  }

  if (!feedbackList || feedbackList.length === 0) {
    return (
      <div className="text-center mt-5">
        <Alert variant="info">No feedback found</Alert>
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <h3 className="text-center mb-4">User Feedback</h3>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Email</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {feedbackList.map((feedback, index) => (
            <tr key={index}>
              <td>{feedback.email}</td>
              <td>{feedback.feedback}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Feedback;
