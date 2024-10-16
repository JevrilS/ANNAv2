// Conversation.js
import React, { useState, useEffect } from 'react';
import { Table, Form, Button, InputGroup, Row, Col, Pagination, Container } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: '',
    strand: 'Overall',
    schoolYear: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState(null);

  // Fetching conversations from the backend API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('http://localhost:8000/get-conversations/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.conversations) {
          setConversations(data.conversations);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        setError(error.message);
      }
    };

    fetchConversations();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle search and filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentConversations = conversations.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container fluid>
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
              <option value="Overall">All</option>
              <option value="STEM">STEM</option>
              <option value="ABM">ABM</option>
              <option value="HUMSS">HUMSS</option>
              <option value="ARTS & DESIGN">ARTS & DESIGN</option>
              <option value="TVL - Information and Communications Technology">
                TVL - Information and Communications Technology
              </option>
              <option value="TVL - Home Economics">TVL - Home Economics</option>
              <option value="TVL - Agri-Fishery Arts">TVL - Agri-Fishery Arts</option>
              <option value="TVL - Industrial Arts">TVL - Industrial Arts</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Control
              type="text"
              name="schoolYear"
              placeholder="School Year (e.g., 2022)"
              value={filters.schoolYear}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={2}>
            <Button variant="warning" className="w-100">
              <i className="fa fa-filter"></i> Filter
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
                  <td className="text-center">{conversation.strand || 'N/A'}</td>
                  <td className="text-center">{conversation.riasec_code || 'N/A'}</td>
                  <td className="text-center">
                    <Button variant="link" className="text-warning">
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
    </Container>
  );
};

export default Conversations;
