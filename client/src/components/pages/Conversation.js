import React, { useState, useEffect } from 'react';
import { Table, Form, Button, InputGroup, Row, Col, Pagination, Container, Modal } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import { Tabs, Tab } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import api from '../../utils/api';  // Import the API utility

const Conversations = () => {
  const normalizeStrand = (strand) => strand.toLowerCase().replace(/[^a-z0-9]/g, '').trim(); // Lowercase, remove non-alphanumeric characters
  const [conversations, setConversations] = useState([]); // Initialize as an empty array
  const [filters, setFilters] = useState({
    searchQuery: '',
    strand: 'Overall',
    schoolYear: 'Overall',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  
  // Modal-related state
  const [showModal, setShowModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // Store user details

  const refreshAccessToken = async (navigate) => {
    try {
      const response = await api.post('/token/refresh/', {
        refresh: localStorage.getItem('refreshToken'),
      });
  
      if (response.status === 200) {
        localStorage.setItem('token', response.data.access);
        return response.data.access;
      } else {
        console.error('Refresh token invalid or expired:', response.data);
        navigate('/admin/login');
        return null;
      }
    } catch (err) {
      console.error('Error refreshing access token:', err);
      navigate('/admin/login');
      return null;
    }
  };
  
  
  const [courses, setCourses] = useState([]); // New state for courses

useEffect(() => {
  const fetchConversationsAndCourses = async () => {
    try {
      let accessToken = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        search: filters.searchQuery || '',
        strand: filters.strand !== 'Overall' ? filters.strand : '',
        school_year: filters.schoolYear !== 'Overall' ? filters.schoolYear : '',
      });
  
      // Fetch conversations
      const response = await api.get(`/get-conversations/?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (response.status === 200) {
        const data = response.data;
        console.log('Fetched Data:', data.conversations);
  
        // Normalize and filter conversations based on strands
        const normalizedConversations = data.conversations.filter((conversation) => {
          const normalizedStrand = normalizeStrand(conversation.strand);
          const filterStrand = normalizeStrand(filters.strand);
  
          return normalizeStrand(filters.strand) === 'overall' || normalizedStrand === filterStrand;
        });
  
        setConversations(normalizedConversations);
      } else {
        console.error('Failed to fetch conversations:', response.status, response.statusText);
      }
  
      // Fetch courses with RIASEC areas
      const courseResponse = await api.get('https://node-backend-807323421144.asia-northeast1.run.app/api/courses');
      setCourses(courseResponse.data); // Save the fetched courses
    } catch (error) {
      console.error('Failed to fetch conversations or courses:', error);
      setError(error.message);
    }
  };
  

  fetchConversationsAndCourses();
}, [filters, currentPage, itemsPerPage]);
  
  
  
  

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatRiasecCode = (riasecCode) => {
    if (!riasecCode || !Array.isArray(riasecCode)) return 'N/A';

    // Extract the first letter of each trait in the RIASEC code
    const code = riasecCode
      .map(trait => trait[0][0].toUpperCase())  // Get the first letter of the trait name
      .join('');  // Join the letters

    return <strong>{code}</strong>;  // Return the code in bold
  };

  // Function to handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value, // Dynamically update the appropriate filter value
    });
  };

  const fetchUserDetails = async (userId) => {
    try {
      let accessToken = localStorage.getItem('token');
      const response = await api.get(`/get-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (response.status === 200) {
        setUserDetails(response.data);
      } else {
        console.error('Failed to fetch user details:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  

  // Handle modal open and fetching details
  const handleShowDetails = (conversation) => {
    if (!conversation.user_id) {
      console.error("No user_id found in conversation");
      return;
    }
    
    setSelectedConversation(conversation); // Set the selected conversation details
    fetchUserDetails(conversation.user_id); // Fetch user details using user_id
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    setSelectedConversation(null);
    setUserDetails(null); // Reset user details
  };

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentConversations = conversations; // Display all conversations

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const abbreviateStrand = (strand) => {
    switch (strand.toUpperCase()) {
      case 'TVL - INFORMATION AND COMMUNICATIONS TECHNOLOGY':
        return 'TVL - ICT';
      case 'TVL - HOME ECONOMICS':
        return 'TVL - HE';
      case 'TVL - AGRI-FISHERY ARTS':
        return 'TVL - AFA';
      case 'TVL - INDUSTRIAL ARTS':
        return 'TVL - IA';
      default:
        return strand; // Return the original strand if no abbreviation is needed
    }
  };
  
  const csvData = [
    {
      Name: userDetails?.full_name || 'N/A',
      "ID No": userDetails?.id_no || 'N/A',
      Email: userDetails?.email || 'N/A',
      "Mobile No": userDetails?.mobile_no || 'N/A',
      "Grade Level": userDetails?.grade_level || 'N/A',
      Sex: userDetails?.sex || 'N/A',
      Strand: userDetails?.strand || 'N/A',
      Age: selectedConversation?.age || 'N/A',
      "Realistic Score": selectedConversation?.realistic_score || 'N/A',
      "Investigative Score": selectedConversation?.investigative_score || 'N/A',
      "Artistic Score": selectedConversation?.artistic_score || 'N/A',
      "Social Score": selectedConversation?.social_score || 'N/A',
      "Enterprising Score": selectedConversation?.enterprising_score || 'N/A',
      "Conventional Score": selectedConversation?.conventional_score || 'N/A',
      "RIASEC Course Recommendations": selectedConversation?.riasec_course_recommendation?.join(', ') || 'N/A',
      "Strand Course Recommendations": selectedConversation?.strand_course_recommendation?.join(', ') || 'N/A',
    },
  ];
  const csvAllData = conversations.map((conversation) => ({
    Name: conversation.name || 'N/A',
    Age: conversation.age || 'N/A',
    Sex: conversation.sex || 'N/A',
    Strand: conversation.strand || 'N/A',
    "Realistic Score": conversation.realistic_score || 'N/A',
    "Investigative Score": conversation.investigative_score || 'N/A',
    "Artistic Score": conversation.artistic_score || 'N/A',
    "Social Score": conversation.social_score || 'N/A',
    "Enterprising Score": conversation.enterprising_score || 'N/A',
    "Conventional Score": conversation.conventional_score || 'N/A',
    "RIASEC Course Recommendations": conversation.riasec_course_recommendation?.join(', ') || 'N/A',
    "Strand Course Recommendations": conversation.strand_course_recommendation?.join(', ') || 'N/A',
  }));
  
  return (
    <Container fluid>
      <Row>
        {/* Main Content */}
        <Col xs={10} className="p-4">
          <h2 className="fw-bold text-center mb-4">Conversations</h2>
  
          {error && <div className="alert alert-danger">{error}</div>}
  
          {/* Search and Filters */}
          <Row className="mb-4">
  <Col md={6}>
    <InputGroup>
      <Form.Control
        type="text"
        placeholder="Search by name (e.g. John Doe)"
        name="searchQuery"
        value={filters.searchQuery}
        onChange={handleFilterChange}
      />
      <Button variant="warning">
        <i className="fa fa-search"></i>
      </Button>
    </InputGroup>
  </Col>
  <Col md={2}>
  <Form.Select name="strand" value={filters.strand} onChange={handleFilterChange}>
                <option value="Overall">Overall</option>
                <option value="STEM">STEM</option>
                <option value="ABM">ABM</option>
                <option value="ARTSDESIGN">ARTS & DESIGN</option>
                <option value="HUMSS">HUMSS</option>
                <option value="TVL - Information and Communications Technology">TVL - Information and Communications Technology</option>
                <option value="TVL - Home Economics">TVL - Home Economics</option>
                <option value="TVL - Agri-Fishery Arts">TVL - Agri-Fishery Arts</option>
                <option value="TVL - Industrial Arts">TVL - Industrial Arts</option>
              </Form.Select>


  </Col>
  <Col md={2}>
    <Form.Select name="schoolYear" value={filters.schoolYear} onChange={handleFilterChange}>
      <option value="Overall">Overall</option>
      <option value="2022-2023">2022-2023</option>
      <option value="2023-2024">2023-2024</option>
      <option value="2024-2025">2024-2025</option>
    </Form.Select>
  </Col>

  <Col md={2}>
    <Button variant="primary" className="w-100">
      <CSVLink
        data={csvAllData}
        filename="conversations_data.csv"
        className="text-white"
        style={{ textDecoration: 'none' }}
      >
        <i className="fa fa-download"></i> Export All
      </CSVLink>
    </Button>
  </Col>
</Row>

          {/* Conversations Table */}
          <Table striped bordered hover responsive>
            <thead style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
              <tr>
                <th className="text-center">Date</th>
                <th className="text-center">Student Name</th>
                <th className="text-center">Age</th>
                <th className="text-center">Sex</th>
                <th className="text-center">Strand</th>
                <th className="text-center">RIASEC Code</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentConversations.length > 0 ? (
                currentConversations.map((conversation, index) => (
                  <tr key={index}>
                    <td className="text-center">{formatDate(conversation.created_at)}</td>
                    <td className="text-center">{conversation.name || 'N/A'}</td>
                    <td className="text-center">{conversation.age || 'N/A'}</td>
                    <td className="text-center">{conversation.sex || 'N/A'}</td>
                    <td className="text-center">{abbreviateStrand(conversation.strand) || 'N/A'}</td>
                    <td className="text-center">{formatRiasecCode(conversation.riasec_code)}</td>
                    <td className="text-center">
                      <Button variant="link" className="text-warning" onClick={() => handleShowDetails(conversation)}>
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No conversations available</td>
                </tr>
              )}
            </tbody>
          </Table>
  
          {/* Pagination */}
          <Row>
            <Col md={6}>
              <div>Items per page: 
                <Form.Select
                  style={{ width: '80px', display: 'inline-block' }}
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </Form.Select>
              </div>
            </Col>
            <Col md={6}>
              <Pagination className="float-end">
                <Pagination.First />
                <Pagination.Prev />
                <Pagination.Item onClick={() => paginate(1)}>1</Pagination.Item>
                <Pagination.Item onClick={() => paginate(2)}>2</Pagination.Item>
                <Pagination.Item onClick={() => paginate(3)}>3</Pagination.Item>
                <Pagination.Next />
                <Pagination.Last />
              </Pagination>
            </Col>
          </Row>
        </Col>
        </Row>


   <Modal show={showModal} onHide={handleCloseModal} size="lg">
  <Modal.Header
    closeButton
    style={{
      paddingBottom: '0.5rem',
      paddingTop: '0.5rem',
      position: 'relative',
      backgroundColor: '#f8f9fa',
    }}
  >
    <Modal.Title className="w-100 text-center" style={{ paddingTop: '0.5rem', fontWeight: 'bold' }}>
      {userDetails?.full_name ? `${userDetails.full_name}'s Details` : 'Details'}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body style={{ backgroundColor: '#f4f6f9' }}>
    {selectedConversation && userDetails ? (
      <Tabs
        defaultActiveKey="userInfo"
        id="details-tabs"
        className="mb-3 fs-5 p-2"
        variant="pills"
        fill
        style={{ whiteSpace: 'nowrap', overflowX: 'auto' }}
      >
        {/* User Information Tab */}
        <Tab eventKey="userInfo" title="User Information">
          <div className="p-3">
            {[
              { label: 'Name', value: userDetails.full_name },
              { label: 'ID No', value: userDetails.id_no },
              { label: 'Email', value: userDetails.email },
              { label: 'Mobile No', value: userDetails.mobile_no },
              { label: 'Grade Level', value: userDetails.grade_level },
              { label: 'Sex', value: userDetails.sex },
              { label: 'Strand', value: userDetails.strand },
              { label: 'Age', value: selectedConversation.age },
            ].map((item, idx) => (
              <Row className="mb-2 justify-content-center" key={idx}>
                <Col md={4} className="text-right">
                  <strong>{item.label}:</strong>
                </Col>
                <Col md={6} className="text-left">
                  {item.value}
                </Col>
              </Row>
            ))}
          </div>
        </Tab>

        {/* RIASEC Scores Tab */}
        <Tab eventKey="riasecScores" title="RIASEC Scores">
          <div className="p-3 text-center">
            {[
              { label: 'Realistic', score: selectedConversation.realistic_score },
              { label: 'Investigative', score: selectedConversation.investigative_score },
              { label: 'Artistic', score: selectedConversation.artistic_score },
              { label: 'Social', score: selectedConversation.social_score },
              { label: 'Enterprising', score: selectedConversation.enterprising_score },
              { label: 'Conventional', score: selectedConversation.conventional_score },
            ].map((item, idx) => (
              <Row className="mb-2 justify-content-center" key={idx}>
                <Col md={6}>
                  <strong>{item.label} Score:</strong>
                </Col>
                <Col md={6}>{item.score}</Col>
              </Row>
            ))}
            <Row className="mb-2 justify-content-center">
              <Col md={6}>
                <strong>RIASEC Code:</strong>
              </Col>
              <Col md={6}>{formatRiasecCode(selectedConversation.riasec_code)}</Col>
            </Row>
          </div>
        </Tab>

{/* RIASEC Course Recommendations Tab */}
<Tab eventKey="courseRecommendations" title="Course Recommendations">
  <div className="p-3">
    <p className="text-center mb-4">
      <strong>RIASEC Course Recommendations:</strong>
    </p>
    <Row className="justify-content-center">
      {selectedConversation.riasec_course_recommendation && selectedConversation.riasec_course_recommendation.length > 0 ? (
        selectedConversation.riasec_course_recommendation.map((course, index) => {
          const riasecMapping = courses.find(c => c.name === course)?.riasec_area || [];

          // Abbreviate RIASEC areas (e.g., Realistic -> R, Investigative -> I, etc.)
          const abbreviatedRIASEC = riasecMapping.map(area => area[0].toUpperCase()).join('');

          return (
            <Col xs={12} md={6} key={index} className="mb-3">
              <li style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
                <span>{course}</span>{' '}
                {abbreviatedRIASEC && (
                  <span style={{ fontWeight: 'bold', color: '#007bff' }}> - {abbreviatedRIASEC}</span>
                )}
              </li>
            </Col>
          );
        })
      ) : (
        <p className="text-center">No recommendations available</p>
      )}
    </Row>
  </div>
</Tab>



        {/* Strand Recommendations Tab */}
        <Tab eventKey="strandRecommendations" title="Strand Recommendations">
          <div className="p-3">
            <p className="text-center">
              <strong>Strand Course Recommendations:</strong>
            </p>
            <Row className="justify-content-center">
              {selectedConversation.strand_course_recommendation && selectedConversation.strand_course_recommendation.length > 0 ? (
                selectedConversation.strand_course_recommendation.map((course, index) => (
                  <Col md={6} key={index}>
                    <li>{course}</li>
                  </Col>
                ))
              ) : (
                <p className="text-center">No recommendations available</p>
              )}
            </Row>
          </div>
        </Tab>
      </Tabs>
    ) : (
      <p className="text-center">Loading details...</p>
    )}
  </Modal.Body>

  <Modal.Footer className="d-flex justify-content-end" style={{ backgroundColor: '#f8f9fa' }}>
    <CSVLink
      data={csvData}
      filename={`${userDetails?.full_name}_Details.csv`}
      className="btn btn-success"
      style={{ backgroundColor: '#198754', color: '#fff' }}
    >
      Download CSV
    </CSVLink>
  </Modal.Footer>
</Modal>


    </Container>
  );
};

export default Conversations;
