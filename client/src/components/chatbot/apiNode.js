import axios from 'axios';

// Create an axios instance for making requests to your Node.js backend API
const apiNode = axios.create({
  baseURL: 'https://node-backend-807323421144.asia-northeast1.run.app', // Replace with the actual URL of your deployed Node.js backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token (if it exists)
apiNode.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh logic
apiNode.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (unauthorized), try refreshing the token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await apiNode.post('/api/token/refresh/', { refresh: refreshToken });
          const { access } = refreshResponse.data;
          
          // Update the new token in localStorage and retry the original request
          localStorage.setItem('token', access);
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          
          return apiNode(originalRequest); // Retry the original request
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiNode;
