// utils/api.js
import axios from 'axios';

// Base URL can be dynamically set according to the domain or subdomain
const baseURL = `http://${window.location.hostname}:8000/api/`;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
