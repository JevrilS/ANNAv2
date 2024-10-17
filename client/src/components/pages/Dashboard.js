import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Nav, Navbar } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import FileSaver from 'file-saver';
import { CSVLink } from 'react-csv';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCommentDots, FaClipboardList } from 'react-icons/fa';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Dropdown, DropdownButton } from 'react-bootstrap';


// Register Chart.js components and plugins
ChartJS.register(...registerables, ChartDataLabels);
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

const chartOptionsWithAdjustedPadding = {
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 2,  // Increase aspect ratio to make the chart wider
  layout: {
    padding: {
      top: 20,
      bottom: 20,  // Add some padding to the bottom
      left: 20,
      right: 20,
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',  // Move the legend to the bottom
    },
    datalabels: {
      anchor: 'end',
      align: 'top',
      color: '#333',
      font: {
        weight: 'bold',
        size: 12,  // Adjust font size
      },
      formatter: (value) => value,
      offset: 4,  // Slight offset to prevent overlap
    },
  },
  scales: {
    x: {
      barThickness: 15,  // Reduce bar thickness to make the chart more compact
      maxBarThickness: 20,  // Set a maximum bar thickness
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
      },
    },
  },
};


const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    gradeLevel: 'Overall',
    strand: 'Overall',
    schoolYear: 'Overall',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const navigate = useNavigate();
  const chartRef = useRef(null);
  const fetchData = async () => {
    try {
      let accessToken = localStorage.getItem('token');
      
      // Create query parameters including school_year, gradeLevel, and strand
      const queryParams = new URLSearchParams({
        gradeLevel: filters.gradeLevel !== 'Overall' ? filters.gradeLevel : '',
        strand: filters.strand !== 'Overall' ? filters.strand : '',
        school_year: filters.schoolYear !== 'Overall' ? filters.schoolYear : '',  // Ensure school_year is included
      });
  
      // Initial request to fetch dashboard data
      const response = await fetch(`/api/dashboard/?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      // Handle token expiration (401 Unauthorized) and refresh if needed
      if (response.status === 401) {
        accessToken = await refreshAccessToken(navigate);
        if (accessToken) {
          const retryResponse = await fetch(`/api/dashboard/?${queryParams.toString()}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
  
          // Handle retry response
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setDashboardData(retryData);  // Set the fetched dashboard data
          } else {
            throw new Error('Failed to refetch data after token refresh');
          }
        } else {
          throw new Error('Token refresh failed');
        }
      } else if (response.ok) {
        const data = await response.json();
        setDashboardData(data);  // Set the fetched dashboard data
        
        // Now log the fetched data
        console.log('Fetched data:', data);  // Log fetched data for debugging
    } else {
        console.error('Failed to fetch dashboard data:', response.status, response.statusText);
        throw new Error('Failed to fetch dashboard data');
    }
    
      // Set loading state to false after fetching
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      navigate('/admin/login');
    }
  };
  
  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);  // Ensure the effect runs every time filters are updated
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Filter handling
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  
  const getFilteredData = () => {
    let filteredData = dashboardData;

    // Ensure that filters are correctly initialized and data is available
    console.log('Current Filters:', filters);
    console.log('Dashboard Data:', dashboardData);

    // Filtering logic (normalize to uppercase for both data and filter)
    if (filters.gradeLevel !== 'Overall') {
      filteredData = filteredData.filter((d) => d.grade_level === filters.gradeLevel);
    }

    if (filters.strand !== 'Overall') {
      filteredData = filteredData.filter((d) => d.strand.toUpperCase() === filters.strand.toUpperCase());
    }

    console.log('Filtered Data:', filteredData);  // Check what data is returned
    return filteredData;
};


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
    HUMSS: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
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

    // Normalize the strand names to avoid case-sensitivity issues
    const normalizedStrand = conversation.strand.toLowerCase();

    // Update the respective strand scores
    Object.keys(strandScores).forEach(strandKey => {
      if (strandKey.toLowerCase() === normalizedStrand) {
        strandScores[strandKey].realistic += conversation.realistic_score;
        strandScores[strandKey].investigative += conversation.investigative_score;
        strandScores[strandKey].artistic += conversation.artistic_score;
        strandScores[strandKey].social += conversation.social_score;
        strandScores[strandKey].enterprising += conversation.enterprising_score;
        strandScores[strandKey].conventional += conversation.conventional_score;
      }
    });
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
          borderColor: '#333',
          borderWidth: 2,
          borderRadius: 5,
          hoverBackgroundColor: '#555',
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
          hidden: true,
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
          label: 'HUMSS',
          data: [
            strandScores.HUMSS.realistic,
            strandScores.HUMSS.investigative,
            strandScores.HUMSS.artistic,
            strandScores.HUMSS.social,
            strandScores.HUMSS.enterprising,
            strandScores.HUMSS.conventional,
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
  
    const totalCount = maleCount + femaleCount;
  
    return {
      labels: ['Male', 'Female', 'Total'],
      datasets: [
        {
          label: 'Gender Distribution',
          data: [maleCount, femaleCount, totalCount],
          backgroundColor: ['#007bff', '#ff6ec7', '#4caf50'],  // Add a color for Total
          borderColor: '#333',
          borderWidth: 2,
          hoverBackgroundColor: ['#0056b3', '#ff3c7f', '#388e3c'],  // Hover colors including Total
          borderRadius: 5,
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
  
    const totalCount = grade11Count + grade12Count;
  
    return {
      labels: ['Grade 11', 'Grade 12', 'Total'],
      datasets: [
        {
          label: 'Grade Level Distribution',
          data: [grade11Count, grade12Count, totalCount],
          backgroundColor: ['#ff6384', '#36a2eb', '#4caf50'],  // Add a color for Total
          borderColor: '#333',
          borderWidth: 2,
          hoverBackgroundColor: ['#ff1c4b', '#1c83d1', '#388e3c'],  // Hover colors including Total
          borderRadius: 5,
        },
      ],
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

  {/* Main Content */}
  <Col xs={10} className="p-4">
  <div className="d-flex justify-content-between align-items-center mb-4">
  <h3>Dashboard</h3>
  <div className="d-flex justify-content-end" style={{ flex: 1 }}>
    {/* Export Dropdown */}
    <DropdownButton
      id="dropdown-export-button"
      title="Export"
      variant="warning"
      className="me-2"
      drop="down-centered"  // Use 'down-centered' to ensure it drops directly under the button
    >
      <Dropdown.Item onClick={downloadPNG}>Download PNG</Dropdown.Item>
      <Dropdown.Item as={CSVLink} data={csvData} filename="dashboard_data.csv">
        Download CSV
      </Dropdown.Item>
    </DropdownButton>
  </div>
</div>



    {/* Filters Section */}
    <Row className="mb-4">
      <Col md={12}>
        <div className="d-flex justify-content-start">
          <Form.Group className="me-3">
            <Form.Label>Grade Level</Form.Label>
            <Form.Select
              name="gradeLevel"
              value={filters.gradeLevel}
              onChange={handleFilterChange}
            >
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
            <option value="ARTSDESIGN">ARTS & DESIGN</option>
            <option value="HUMSS">HUMSS</option>
            <option value="TVL - Information and Communications Technology">TVL - Information and Communications Technology</option>
            <option value="TVL - Home Economics">TVL - Home Economics</option>
            <option value="TVL - Agri-Fishery Arts">TVL - Agri-Fishery Arts</option>
            <option value="TVL - Industrial Arts">TVL - Industrial Arts</option>
          </Form.Select>
        </Form.Group>

          <Form.Group className="me-3">
            <Form.Label>School Year</Form.Label>
            <Form.Select name="schoolYear" value={filters.schoolYear} onChange={handleFilterChange}>
              <option value="Overall">Overall</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
            </Form.Select>
          </Form.Group>

          <Button className="mt-auto">Filter</Button>
        </div>
      </Col>
    </Row>

    {/* Charts Section */}
    <Row>
      <Col md={6}>
        <div ref={chartRef} style={{ height: '400px' }}>
          <Bar data={getRiasecChartData()} options={chartOptionsWithAdjustedPadding} />
        </div>
      </Col>

      <Col md={6}>
        <Bar data={getSexChartData()} options={chartOptionsWithAdjustedPadding} />
      </Col>
    </Row>

    <Row className="mt-4">
      <Col md={12} className="d-flex justify-content-center">
        <div style={{ width: '80%', maxWidth: '800px', height: '250px' }}>
          <Bar data={getGradeLevelChartData()} options={chartOptionsWithAdjustedPadding} />
        </div>
      </Col>
    </Row>
  </Col>
</Row>

  </Container>
  
  


  );
};
export default Dashboard;
