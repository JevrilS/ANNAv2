import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate for navigation
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../utils/api'; // Axios instance for making requests

const Results = () => {
  const [conversationData, setConversationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Fetch student result data from custom_auth_conversations
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await api.get('/auth/get-conversations/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Conversation Data:', response.data);

        if (response.data.conversations && response.data.conversations.length > 0) {
          const firstConversation = response.data.conversations[0]; // Access the first conversation
          setConversationData(firstConversation);
        } else {
          setConversationData(null);
        }

        setLoading(false);
      } catch (error) {
        console.error(
          'Error fetching conversation data:',
          error.response ? error.response.data : error.message
        );
        toast.error('Failed to fetch results');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!conversationData) {
    return <div>No results found</div>;
  }

  return (
    <div className="container mt-5 p-4 shadow-sm bg-light rounded">
      {/* Back Button */}
      <div className="d-flex justify-content-start mb-4">
        <button className="btn btn-link text-decoration-none" onClick={handleBackClick}>
          <i className="bi bi-arrow-left-circle-fill fs-3 text-warning"></i>
        </button>
      </div>

      {/* Centered Student Information Section */}
      <div className="row mb-5 justify-content-center text-center">
        <div className="col-md-2">
          <strong className="d-block mb-2" style={{ fontSize: '1.2rem' }}>Student Name</strong>
          <p className="text-muted" style={{ fontSize: '1rem' }}>{conversationData.name}</p>
        </div>
        <div className="col-md-2">
          <strong className="d-block mb-2" style={{ fontSize: '1.2rem' }}>Age</strong>
          <p className="text-muted" style={{ fontSize: '1rem' }}>{conversationData.age}</p>
        </div>
        <div className="col-md-2">
          <strong className="d-block mb-2" style={{ fontSize: '1.2rem' }}>Sex</strong>
          <p className="text-muted" style={{ fontSize: '1rem' }}>{conversationData.sex}</p>
        </div>
        <div className="col-md-2">
          <strong className="d-block mb-2" style={{ fontSize: '1.2rem' }}>Strand</strong>
          <p className="text-muted" style={{ fontSize: '1rem' }}>{conversationData.strand}</p>
        </div>
      </div>

      {/* RIASEC Code */}
      <div className="row text-center mb-4 d-flex justify-content-center">
        {conversationData.riasec_code.map((code, index) => (
          <div key={index} className="col-md-2 col-4 mb-3">
            <div className="bg-warning text-white rounded py-4">
              <strong className="d-block">{code[0].toUpperCase()}</strong>
              <span className="fs-4">{code[1]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="suggestions mt-4">
        <h4 className="text-center mb-4">ANNA RECOMMENDATIONS</h4>

        <div className="row">
          {/* RIASEC Courses */}
          <div className="col-md-6 mb-3">
            <h5 className="text-center">RIASEC</h5>
            <ul className="list-group list-group-flush border rounded">
              {conversationData.riasec_course_recommendation.map((course, index) => (
                <li key={index} className="list-group-item py-2">
                  {course}
                </li>
              ))}
            </ul>
          </div>

          {/* Strand Courses */}
          <div className="col-md-6 mb-3">
            <h5 className="text-center">STRAND</h5>
            <ul className="list-group list-group-flush border rounded">
              {conversationData.strand_course_recommendation.map((course, index) => (
                <li key={index} className="list-group-item py-2">
                  {course}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
