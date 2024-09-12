from google.cloud import dialogflow_v2 as dialogflow
from google.oauth2 import service_account
from google.protobuf.struct_pb2 import Struct

class DialogflowService:
    def __init__(self, project_id, session_id, language_code, credentials_info):
        self.project_id = project_id
        self.session_id = session_id
        self.language_code = language_code
        self.credentials = service_account.Credentials.from_service_account_info(credentials_info)
        
    def _create_session_client(self):
        return dialogflow.SessionsClient(credentials=self.credentials)

    def detect_intent_texts(self, text, session_id=None, language_code=None):
        session_client = self._create_session_client()
        session_id = session_id or self.session_id
        language_code = language_code or self.language_code
        session = session_client.session_path(self.project_id, session_id)
        
        text_input = dialogflow.TextInput(text=text, language_code=language_code)
        query_input = dialogflow.QueryInput(text=text_input)

        response = session_client.detect_intent(request={"session": session, "query_input": query_input})
        return response.query_result

    def detect_intent_event(self, event, parameters=None, session_id=None, language_code=None):
        session_client = self._create_session_client()
        session_id = session_id or self.session_id
        language_code = language_code or self.language_code
        session = session_client.session_path(self.project_id, session_id)

        # Prepare event input
        event_input = dialogflow.EventInput(name=event, language_code=language_code)

        # Convert parameters to protobuf struct if they exist
        struct_parameters = Struct()
        if parameters:
            struct_parameters.update(parameters)

        # Query input with event
        query_input = dialogflow.QueryInput(event=event_input)
        
        # Attach parameters to query if available
        request = {"session": session, "query_input": query_input}
        if parameters:
            request["query_params"] = {"payload": struct_parameters}

        response = session_client.detect_intent(request=request)
        query_result = response.query_result
        
        # Log response to verify the structure
        print(f"Full Dialogflow Response: {response}")
        print(f"Detected Intent: {query_result.intent.display_name if query_result.intent else 'undefined'}")
        
        return query_result
