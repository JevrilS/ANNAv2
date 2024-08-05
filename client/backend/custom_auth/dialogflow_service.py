from google.cloud import dialogflow_v2 as dialogflow
import os
from google.oauth2 import service_account

# Load credentials from environment variables
credentials_info = {
    "type": "service_account",
    "project_id": os.getenv('GOOGLE_PROJECT_ID'),
    "private_key_id": "your_private_key_id",
    "private_key": os.getenv('GOOGLE_PRIVATE_KEY').replace('\\n', '\n'),
    "client_email": os.getenv('GOOGLE_CLIENT_EMAIL'),
    "client_id": "your_client_id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "your_client_x509_cert_url"
}

# Create credentials object
credentials = service_account.Credentials.from_service_account_info(credentials_info)

class DialogflowService:
    def __init__(self, project_id, session_id, language_code):
        self.project_id = project_id
        self.session_id = session_id
        self.language_code = language_code
        self.session_client = dialogflow.SessionsClient(credentials=credentials)

    def detect_intent_texts(self, text, session_id):
        session = self.session_client.session_path(self.project_id, session_id)
        text_input = dialogflow.TextInput(text=text, language_code=self.language_code)
        query_input = dialogflow.QueryInput(text=text_input)
        response = self.session_client.detect_intent(request={"session": session, "query_input": query_input})
        return response.query_result

    def detect_intent_event(self, event, session_id, parameters=None):
        session = self.session_client.session_path(self.project_id, session_id)
        event_input = dialogflow.EventInput(name=event, parameters=parameters, language_code=self.language_code)
        query_input = dialogflow.QueryInput(event=event_input)
        response = self.session_client.detect_intent(request={"session": session, "query_input": query_input})
        return response.query_result
