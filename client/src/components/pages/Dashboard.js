import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Nav, Navbar } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import FileSaver from 'file-saver';
import { CSVLink } from 'react-csv';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCommentDots, FaClipboardList } from 'react-icons/fa';  // Import icons

// Token refresh function
const refreshAccessToken = async (navigate) => {
  try {
    const response = await fetch('/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: localStorage.getItem('refreshToken') }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.access);
      return data.access;
    } else {
      console.error('Refresh token invalid or expired:', data);
      navigate('/admin/login');
    }
  } catch (err) {
    console.error('Error refreshing access token:', err);
    navigate('/admin/login');
  }
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    gradeLevel: 'Overall',
    strand: 'Overall',
    schoolYear: '2023-2024',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const navigate = useNavigate();
  const chartRef = useRef(null);

  // Fetch data from backend API with token handling
  const fetchData = async () => {
    try {
      let accessToken = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        accessToken = await refreshAccessToken(navigate);
        if (accessToken) {
          const retryResponse = await fetch('/api/dashboard/', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const retryData = await retryResponse.json();
          setDashboardData(retryData);
        }
      } else {
        const data = await response.json();
        setDashboardData(data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      navigate('/admin/login');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Filter handling
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const getFilteredData = () => {
    let filteredData = dashboardData;

    if (filters.gradeLevel !== 'Overall') {
      filteredData = filteredData.filter((d) => d.grade_level === filters.gradeLevel);
    }

    if (filters.strand !== 'Overall') {
      filteredData = filteredData.filter((d) => d.strand === filters.strand);
    }

    return filteredData;
  };

  // Prepare chart data
  const getRiasecChartData = () => {
    const filteredData = getFilteredData();
  
    const totalScores = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0,
    };
  
    const strandScores = {
      ABM: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
      ARTSDESIGN: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
      STEM: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
      HUMMS: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
      'TVL - Information and Communications Technology': { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
      'TVL - Home Economics': { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
      'TVL - Agri-Fishery Arts': { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
      'TVL - Industrial Arts': { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
    };
  
    filteredData.forEach((conversation) => {
      totalScores.realistic += conversation.realistic_score;
      totalScores.investigative += conversation.investigative_score;
      totalScores.artistic += conversation.artistic_score;
      totalScores.social += conversation.social_score;
      totalScores.enterprising += conversation.enterprising_score;
      totalScores.conventional += conversation.conventional_score;
  
      // Update the respective strand scores
      if (conversation.strand in strandScores) {
        strandScores[conversation.strand].realistic += conversation.realistic_score;
        strandScores[conversation.strand].investigative += conversation.investigative_score;
        strandScores[conversation.strand].artistic += conversation.artistic_score;
        strandScores[conversation.strand].social += conversation.social_score;
        strandScores[conversation.strand].enterprising += conversation.enterprising_score;
        strandScores[conversation.strand].conventional += conversation.conventional_score;
      }
    });
  
    return {
      labels: ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'],
      datasets: [
        {
          label: 'Total',
          data: [
            totalScores.realistic,
            totalScores.investigative,
            totalScores.artistic,
            totalScores.social,
            totalScores.enterprising,
            totalScores.conventional,
          ],
          backgroundColor: '#28a745',
        },
        {
          label: 'ABM',
          data: [
            strandScores.ABM.realistic,
            strandScores.ABM.investigative,
            strandScores.ABM.artistic,
            strandScores.ABM.social,
            strandScores.ABM.enterprising,
            strandScores.ABM.conventional,
          ],
          backgroundColor: '#fd7e14',
          hidden: true, // Initially hidden
        },
        {
          label: 'ARTS & DESIGN',
          data: [
            strandScores.ARTSDESIGN.realistic,
            strandScores.ARTSDESIGN.investigative,
            strandScores.ARTSDESIGN.artistic,
            strandScores.ARTSDESIGN.social,
            strandScores.ARTSDESIGN.enterprising,
            strandScores.ARTSDESIGN.conventional,
          ],
          backgroundColor: '#17a2b8',
          hidden: true,
        },
        {
          label: 'STEM',
          data: [
            strandScores.STEM.realistic,
            strandScores.STEM.investigative,
            strandScores.STEM.artistic,
            strandScores.STEM.social,
            strandScores.STEM.enterprising,
            strandScores.STEM.conventional,
          ],
          backgroundColor: '#ffc107',
          hidden: true,
        },
        {
          label: 'HUMMS',
          data: [
            strandScores.HUMMS.realistic,
            strandScores.HUMMS.investigative,
            strandScores.HUMMS.artistic,
            strandScores.HUMMS.social,
            strandScores.HUMMS.enterprising,
            strandScores.HUMMS.conventional,
          ],
          backgroundColor: '#dc3545',
          hidden: true,
        },
        {
          label: 'TVL - Information and Communications Technology',
          data: [
            strandScores['TVL - Information and Communications Technology'].realistic,
            strandScores['TVL - Information and Communications Technology'].investigative,
            strandScores['TVL - Information and Communications Technology'].artistic,
            strandScores['TVL - Information and Communications Technology'].social,
            strandScores['TVL - Information and Communications Technology'].enterprising,
            strandScores['TVL - Information and Communications Technology'].conventional,
          ],
          backgroundColor: '#007bff',
          hidden: true,
        },
        {
          label: 'TVL - Home Economics',
          data: [
            strandScores['TVL - Home Economics'].realistic,
            strandScores['TVL - Home Economics'].investigative,
            strandScores['TVL - Home Economics'].artistic,
            strandScores['TVL - Home Economics'].social,
            strandScores['TVL - Home Economics'].enterprising,
            strandScores['TVL - Home Economics'].conventional,
          ],
          backgroundColor: '#6c757d',
          hidden: true,
        },
        {
          label: 'TVL - Agri-Fishery Arts',
          data: [
            strandScores['TVL - Agri-Fishery Arts'].realistic,
            strandScores['TVL - Agri-Fishery Arts'].investigative,
            strandScores['TVL - Agri-Fishery Arts'].artistic,
            strandScores['TVL - Agri-Fishery Arts'].social,
            strandScores['TVL - Agri-Fishery Arts'].enterprising,
            strandScores['TVL - Agri-Fishery Arts'].conventional,
          ],
          backgroundColor: '#20c997',
          hidden: true,
        },
        {
          label: 'TVL - Industrial Arts',
          data: [
            strandScores['TVL - Industrial Arts'].realistic,
            strandScores['TVL - Industrial Arts'].investigative,
            strandScores['TVL - Industrial Arts'].artistic,
            strandScores['TVL - Industrial Arts'].social,
            strandScores['TVL - Industrial Arts'].enterprising,
            strandScores['TVL - Industrial Arts'].conventional,
          ],
          backgroundColor: '#ffc0cb',
          hidden: true,
        },
      ],
    };
  };
  
  // Chart options with legend interactivity
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Disable default aspect ratio
    plugins: {
      legend: {
        display: true,
        onClick: (e, legendItem) => {
          const index = legendItem.datasetIndex;
          const ci = legendItem.chart;
          const meta = ci.getDatasetMeta(index);
  
          // Toggle the visibility of the clicked dataset
          meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          ci.update();
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  
  // Use in the component
  <Bar data={getRiasecChartData()} options={options} />;
  
  const getSexChartData = () => {
    const filteredData = getFilteredData();
    let maleCount = 0;
    let femaleCount = 0;

    filteredData.forEach((conversation) => {
      if (conversation.sex === 'Male') {
        maleCount += 1;
      } else if (conversation.sex === 'Female') {
        femaleCount += 1;
      }
    });

    return {
      labels: ['Male', 'Female'],
      datasets: [
        {
          label: 'Gender Distribution',
          data: [maleCount, femaleCount],
          backgroundColor: ['#007bff', '#ff6ec7'],
        },
      ],
    };
  };
  
  const getGradeLevelChartData = () => {
    const filteredData = getFilteredData();
    let grade11Count = 0;
    let grade12Count = 0;
  
    filteredData.forEach((conversation) => {
      if (conversation.grade_level === '11') {
        grade11Count += 1;
      } else if (conversation.grade_level === '12') {
        grade12Count += 1;
      }
    });
  
    // Define chart data and options
    return {
      labels: ['Gr:11', 'Gr:12'],
      datasets: [
        {
          label: 'Students by Grade Level',
          data: [grade11Count, grade12Count],
          backgroundColor: ['#007bff', '#dc3545'],
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false, // Disable default aspect ratio
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1, // Ensure integer values only
            },
          },
        },
      },
    };
  };
  
  
  // Function to download chart as PNG
  const downloadPNG = () => {
    html2canvas(chartRef.current).then((canvas) => {
      canvas.toBlob(function (blob) {
        FileSaver.saveAs(blob, 'dashboard.png');
      });
    });
  };

  // CSV data for download
  const csvData = dashboardData.map((row) => ({
    Name: row.name,
    Sex: row.sex,
    Strand: row.strand,
    'Realistic Score': row.realistic_score,
    'Investigative Score': row.investigative_score,
    'Artistic Score': row.artistic_score,
    'Social Score': row.social_score,
    'Enterprising Score': row.enterprising_score,
    'Conventional Score': row.conventional_score,
  }));
  return (
    <Container fluid>
    <Row>
      {/* Sidebar */}
      <Col
        xs="auto"
        className="bg-warning vh-100"
        style={{
          width: isSidebarCollapsed ? '80px' : '200px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ marginTop: '20px' }}>
          <Button
            variant="link"
            className="text-white"
            onClick={toggleSidebar}
            style={{ marginBottom: '20px' }}
          >
            {/* Hamburger Icon for toggling sidebar */}
            <span className="navbar-toggler-icon"></span>
          </Button>
  
          <Nav className="flex-column text-center">
            <Nav.Item className="mb-2">
              <Nav.Link
                href="/admin/dashboard"
                className="text-white fw-bold d-flex align-items-center justify-content-center"
                style={{
                  flexDirection: isSidebarCollapsed ? 'column' : 'row',
                  transition: 'all 0.3s ease',
                  fontSize: isSidebarCollapsed ? '0.8rem' : '1rem',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.querySelector('svg').style.fill = 'white';
                  e.currentTarget.querySelector('span').style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.querySelector('svg').style.fill = '';
                  e.currentTarget.querySelector('span').style.color = '';
                }}
              >
                <FaHome className="me-2" size={isSidebarCollapsed ? 25 : 20} />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </Nav.Link>
            </Nav.Item>
  
            <Nav.Item className="mb-2">
              <Nav.Link
                href="conversation"
                className="text-white fw-bold d-flex align-items-center justify-content-center"
                style={{
                  flexDirection: isSidebarCollapsed ? 'column' : 'row',
                  transition: 'all 0.3s ease',
                  fontSize: isSidebarCollapsed ? '0.8rem' : '1rem',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.querySelector('svg').style.fill = 'white';
                  e.currentTarget.querySelector('span').style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.querySelector('svg').style.fill = '';
                  e.currentTarget.querySelector('span').style.color = '';
                }}
              >
                <FaClipboardList className="me-2" size={isSidebarCollapsed ? 25 : 20} />
                {!isSidebarCollapsed && <span>Conversations</span>}
              </Nav.Link>
            </Nav.Item>
  
            <Nav.Item className="mb-2">
              <Nav.Link
                href="/admin/feedback"
                className="text-white fw-bold d-flex align-items-center justify-content-center"
                style={{
                  flexDirection: isSidebarCollapsed ? 'column' : 'row',
                  transition: 'all 0.3s ease',
                  fontSize: isSidebarCollapsed ? '0.8rem' : '1rem',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.querySelector('svg').style.fill = 'white';
                  e.currentTarget.querySelector('span').style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                  e.currentTarget.querySelector('svg').style.fill = '';
                  e.currentTarget.querySelector('span').style.color = '';
                }}
              >
                <FaCommentDots className="me-2" size={isSidebarCollapsed ? 25 : 20} />
                {!isSidebarCollapsed && <span>Feedback</span>}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
      </Col>
  
      {/* Main Content */}
      <Col
        xs={isSidebarCollapsed ? 11 : 10}
        className="p-4"
        style={{
          transition: 'width 0.3s ease',
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Dashboard</h3>
          <div>
            <Button className="me-2" onClick={downloadPNG}>
              Download PNG
            </Button>
            <CSVLink data={csvData} filename="dashboard_data.csv" className="btn btn-success">
              Download CSV
            </CSVLink>
          </div>
        </div>
  
        {/* Filters */}
        <div className="d-flex justify-content-start mb-4">
          <Form.Group className="me-3">
            <Form.Label>Grade Level</Form.Label>
            <Form.Select name="gradeLevel" value={filters.gradeLevel} onChange={handleFilterChange}>
              <option value="Overall">Overall</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </Form.Select>
          </Form.Group>
  
          <Form.Group className="me-3">
            <Form.Label>Strand</Form.Label>
            <Form.Select name="strand" value={filters.strand} onChange={handleFilterChange}>
              <option value="Overall">Overall</option>
              <option value="STEM">STEM</option>
              <option value="ABM">ABM</option>
              <option value="ARTS & DESIGN">Arts & Design</option>
              <option value="HUMSS">HUMSS</option>
              <option value="GAS">GAS</option>
            </Form.Select>
          </Form.Group>
  
          <Form.Group className="me-3">
            <Form.Label>School Year</Form.Label>
            <Form.Select name="schoolYear" value={filters.schoolYear} onChange={handleFilterChange}>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </Form.Select>
          </Form.Group>
  
          <Button className="mt-auto">Filter</Button>
        </div>
  
        {/* Charts */}
        <Row>
          <Col md={6}>
            <div ref={chartRef}>
              <Bar data={getRiasecChartData()} />
            </div>
          </Col>
          <Col md={6}>
            <Bar data={getSexChartData()} />
          </Col>
        </Row>
  
        <Row className="mt-4">
          <Col md={12} className="d-flex justify-content-center">
            <div style={{ width: '80%', maxWidth: '800px', height: '300px' }}>
              <Bar data={getGradeLevelChartData()} options={getGradeLevelChartData().options} />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  </Container>
  
  
);
};
export default Dashboard;
