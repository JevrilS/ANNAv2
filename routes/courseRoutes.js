const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Make sure the Course model is correctly defined

// GET all courses with their RIASEC areas
router.get('/courses', async (req, res) => {
    console.log('GET /courses route hit'); // Debugging log
    try {
      const courses = await Course.find();
      res.json(courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });
  

module.exports = router;
