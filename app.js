const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    console.log('Connected to MongoDB database successfully');
  } catch (err) {
    console.error('Error while connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  }
};
connectDB();

// MongoDB Events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// CORS Configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL], // Ensure to add your frontend URL here
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api', require('./routes/courseRoutes')); // Course routes
app.use('/auth', require('./routes/authenticationRoutes')); // Authentication routes
app.use('/admin', require('./routes/adminRoutes')); // Admin routes
app.use('/user', require('./routes/UserRoutes')); // User routes

// Dialogflow and Fulfillment Routes
require('./routes/dialogflowRoutes')(app); // Dialogflow routes
require('./routes/fullfillmentRoutes')(app); // Fulfillment routes

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'client', 'build')));

  // Fallback for any unknown routes to serve React frontend
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}
app.options('*', cors()); // Enable preflight across all routes

// Error handling for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
