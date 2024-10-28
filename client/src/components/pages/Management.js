import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Table, Container, Form, Alert } from 'react-bootstrap';
import api from '../../utils/api'; // API utility to handle requests

const Management = () => {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userSchoolId, setUserSchoolId] = useState(null); // Store the user's school ID

  useEffect(() => {
    // Fetch the logged-in user's school ID and sections based on that
    const fetchSchoolAndSections = async () => {
      try {
        // Fetch logged-in user's school_id (assuming it's available via auth API)
        const userResponse = await api.get('/auth/user');
        const schoolId = userResponse.data.school_id;
        setUserSchoolId(schoolId);

        // Fetch sections based on the user's school_id
        const response = await api.get(`/sections?school_id=${schoolId}`);
        setSections(response.data);
      } catch (err) {
        setError('Error fetching sections.');
      }
    };

    fetchSchoolAndSections();
  }, []);

  const handleAddSection = async () => {
    if (!newSectionName) {
      setError('Section name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/sections', {
        name: newSectionName,
        school_id: userSchoolId, // Add section to the user's school only
      });

      // Add the newly created section to the state
      setSections((prevSections) => [...prevSections, response.data]);
      setNewSectionName('');
      setSuccess('Section added successfully.');
    } catch (err) {
      setError('Error adding new section.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Management Dashboard</h2>

      {/* Display success or error message */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Section Management */}
      <Row>
        <Col md={12}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-warning text-white text-center">
              <h4>Manage Sections</h4>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Section Name</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.length > 0 ? (
                    sections.map((section, index) => (
                      <tr key={section.id}>
                        <td>{index + 1}</td>
                        <td>{section.name}</td>
                        <td>{new Date(section.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button variant="primary" size="sm" className="me-2">
                            Edit
                          </Button>
                          <Button variant="danger" size="sm">
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No sections available for your school.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add New Section */}
      <Row>
        <Col md={6} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Add New Section</h5>
              <Form>
                <Form.Group>
                  <Form.Label>Section Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Enter section name"
                  />
                </Form.Group>
                <Button
                  variant="success"
                  onClick={handleAddSection}
                  className="mt-3"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Section'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Management;
