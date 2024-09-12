import os
from google.cloud import dialogflow_v2 as dialogflow
from google.oauth2 import service_account

class DialogflowService:
    def __init__(self, project_id, session_id, language_code, credentials_info):
        self.project_id = project_id
        self.session_id = session_id
        self.language_code = language_code
        self.credentials_info = credentials_info
        self.credentials = self._get_credentials()

    def _get_credentials(self):
        return service_account.Credentials.from_service_account_info(self.credentials_info)

    def detect_intent_text(self, text):
        session_client = dialogflow.SessionsClient(credentials=self.credentials)
        session = session_client.session_path(self.project_id, self.session_id)
        text_input = dialogflow.TextInput(text=text, language_code=self.language_code)
        query_input = dialogflow.QueryInput(text=text_input)
        response = session_client.detect_intent(request={"session": session, "query_input": query_input})
        return response.query_result

    def detect_intent_event(self, event, parameters, location_id="global"):
        session_client = dialogflow.SessionsClient(credentials=self.credentials)
        session = session_client.session_path(self.project_id, self.session_id)
        if location_id != "global":
            session = f"projects/{self.project_id}/locations/{location_id}/agent/sessions/{self.session_id}"
        event_input = dialogflow.EventInput(name=event, parameters=parameters, language_code=self.language_code)
        query_input = dialogflow.QueryInput(event=event_input)
        response = session_client.detect_intent(request={"session": session, "query_input": query_input})
        return response.query_result