'use strict';

// Import the required modules
const { SessionsClient } = require('@google-cloud/dialogflow');
const structjson = require('structjson');
const config = require('../config/key');

// Dialogflow project credentials and session configuration
const projectId = config.google_project_id;
const sessionId = config.dialogflow_session_id;
const languageCode = config.dialogflow_session_language_code;

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
  // Log and handle text queries
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

    console.log('Text query being sent:', request); // Log the request being sent to Dialogflow

    try {
      let responses = await sessionClient.detectIntent(request);
      console.log('Text query responses from Dialogflow:', JSON.stringify(responses, null, 2)); // Log the response from Dialogflow

      responses = await self.handleAction(responses);
      return responses;
    } catch (err) {
      console.error('Dialogflow Error:', err);
    }
  },

  // Log and handle event queries
  eventQuery: async (event, userId, parameters = {}) => {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId + userId);
    const self = module.exports;

    // Log the parameters before sending them to Dialogflow
    console.log("Event being sent:", event);  // Log the event name
    console.log("Parameters being sent:", parameters);  // Log the parameters (like strand)

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

    try {
       let responses = await sessionClient.detectIntent(request);
       console.log('Dialogflow responses:', JSON.stringify(responses, null, 2)); // Log the entire response from Dialogflow

       responses = await self.handleAction(responses);
       return responses;
    } catch (err) {
       console.error('Dialogflow Error:', err);
    }
  },

  // Handle actions in response
  handleAction: (responses) => {
    console.log('Handling actions for responses:', JSON.stringify(responses, null, 2)); // Log the responses being handled
    return responses; // Return the handled responses
  },
};
