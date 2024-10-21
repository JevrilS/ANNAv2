import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Ensure this is correct
import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot for React 18
import App from './App';
import reportWebVitals from './reportWebVitals';

// Find the root element
const container = document.getElementById('root');

// Use createRoot instead of ReactDOM.render
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
