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
  textQuery: async (text, userId, parameters = {}) => {
    // Define the session path
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

    try {
      let responses = await sessionClient.detectIntent(request);
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
