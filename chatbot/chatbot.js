'use strict';

// Import the required modules
const { SessionsClient } = require('@google-cloud/dialogflow');
const structjson = require('structjson');
const config = require('../config/key');
const MongoClient = require('mongodb').MongoClient;  // Import MongoDB client

// Dialogflow project credentials and session configuration
const projectId = config.google_project_id;
const sessionId = config.dialogflow_session_id;
const languageCode = config.dialogflow_session_language_code;

// MongoDB connection string
const mongoUri = config.mongodb_uri;  // Ensure your MongoDB URI is set in the config

// Prepare credentials with the correct formatting
const credentials = {
  client_email: config.google_client_email,
  private_key: config.google_private_key.replace(/\\n/g, '\n'), // Ensure newlines are handled properly
};

// Create a new session client with Dialogflow
const sessionClient = new SessionsClient({
  projectId,
  credentials,
});

module.exports = {
  textQuery: async (text, userId, parameters = {}) => {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId + userId);
    const self = module.exports;

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode,
        },
      },
      queryParams: {
        payload: {
          data: parameters,
        },
      },
    };

    try {
      let responses = await sessionClient.detectIntent(request);
      responses = await self.handleAction(responses);
      return responses;
    } catch (err) {
      console.error('Dialogflow Error:', err);
    }
  },

  eventQuery: async (event, userId, parameters = {}) => {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId + userId);
    const self = module.exports;

    const request = {
       session: sessionPath,
       queryInput: {
          event: {
             name: event,
             parameters: structjson.jsonToStructProto(parameters),
             languageCode,
          },
       },
    };

    console.log("Event being sent:", event);  // Log the event name
    console.log("Parameters being sent:", parameters);  // Log the parameters (like strand)

    try {
       let responses = await sessionClient.detectIntent(request);

       // If event is 'STRAND_RECOMMENDATION', perform MongoDB query for courses
       if (event === 'STRAND_RECOMMENDATION') {
           const strand = parameters.strand;  // Get the strand from the parameters

           // Normalize strand for case-insensitive matching
           const normalizedStrand = strand.trim().toLowerCase();

           // Connect to MongoDB and query for the recommended courses
           const client = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
           const db = client.db('annav2_chatbot');  // Replace with your actual DB name
           
           // MongoDB query to find courses matching the strand
           const recommendedCourses = await db.collection('courses').find({
              strand: { $regex: new RegExp('^' + normalizedStrand + '$', 'i') } // Case-insensitive matching for strand
           }).toArray();

           console.log('Courses received:', recommendedCourses);  // Log courses for debugging
           
           // Check if courses are found and modify the response
           if (recommendedCourses.length > 0) {
               // Modify the responses to include the recommended courses
               responses.queryResult.fulfillmentMessages.push({
                   text: {
                       text: [`Based on your strand, here are some recommended degree programs: ${recommendedCourses.map(course => course.name).join(', ')}`]
                   }
               });
           } else {
               // No courses found message
               responses.queryResult.fulfillmentMessages.push({
                   text: {
                       text: ['No recommended courses found for your strand.']
                   }
               });
           }

           await client.close();  // Close the MongoDB connection
       }

       responses = await self.handleAction(responses);
       return responses;
    } catch (err) {
       console.error('Dialogflow Error:', err);
    }
  },

  handleAction: (responses) => {
    // Temporary function to handle actions
    return responses;
  },
};
