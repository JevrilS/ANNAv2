from google.cloud import dialogflow_v2 as dialogflow
from google.oauth2 import service_account
from google.protobuf.struct_pb2 import Struct
from django.http import request

class DialogflowService:
    def __init__(self, project_id, session_id, language_code, credentials_info):
        self.project_id = project_id
        self.session_id = session_id
        self.language_code = language_code
        self.credentials = service_account.Credentials.from_service_account_info(credentials_info)

    def _create_session_client(self):
        return dialogflow.SessionsClient(credentials=self.credentials)

    def detect_intent_texts(self, text, session_id=None, language_code=None):
        """Detect intent based on the user's input text."""
        session_client = self._create_session_client()
        session_id = session_id or self.session_id
        language_code = language_code or self.language_code
        session = session_client.session_path(self.project_id, session_id)

        text_input = dialogflow.TextInput(text=text, language_code=language_code)
        query_input = dialogflow.QueryInput(text=text_input)

        try:
            response = session_client.detect_intent(request={"session": session, "query_input": query_input})
            query_result = response.query_result

            if query_result is None:
                print("No query result returned from Dialogflow.")
                return {"intent": {"displayName": "unknown"}, "fulfillment_text": "I'm not sure what you mean. Could you please rephrase that?"}  # Return a default message

            # Proceed with handling query_result as normal
            intent_name = query_result.intent.display_name if query_result.intent else "unknown"
            print(f"Detected Intent: {intent_name}")

            # Handle intents
            self.handle_intent(intent_name, query_result)
            return query_result
        except Exception as e:
            print(f"Error detecting intent: {str(e)}")
            return {"intent": {"displayName": "error"}, "fulfillment_text": "Sorry, something went wrong."}

    def detect_intent_event(self, event, parameters=None, session_id=None, language_code=None):
        """Detect intent based on an event input from Dialogflow."""
        session_client = self._create_session_client()
        session_id = session_id or self.session_id
        language_code = language_code or self.language_code
        session = session_client.session_path(self.project_id, session_id)

        event_input = dialogflow.EventInput(name=event, language_code=language_code)

        query_parameters = dialogflow.QueryParameters()
        if parameters:
            struct_parameters = Struct()
            struct_parameters.update(parameters)
            query_parameters.payload = struct_parameters

        query_input = dialogflow.QueryInput(event=event_input)

        request = {"session": session, "query_input": query_input}
        if parameters:
            request["query_params"] = query_parameters

        try:
            response = session_client.detect_intent(request=request)
            query_result = response.query_result

            if query_result is None:
                return {"intent": {"displayName": "unknown"}, "fulfillment_text": "I'm not sure what you mean. Could you please rephrase that?"}

            intent_name = query_result.intent.display_name if query_result.intent else "unknown"
            print(f"Detected Intent (Event): {intent_name}")

            # Handle intents
            self.handle_intent(intent_name, query_result)

            return query_result
        except Exception as e:
            print(f"Error detecting intent from event: {str(e)}")
            return {"intent": {"displayName": "error"}, "fulfillment_text": "Sorry, something went wrong."}

    def handle_intent(self, intent_name, query_result):
        """Handle specific intents like 'get-name', 'Default Welcome Intent', 'fallback-exceed-trigger-limit'."""
        if intent_name == 'get-name':
            self.handle_get_name(query_result.query_text)
        elif intent_name == 'get-age':
            self.handle_get_age(query_result.parameters.fields.get('age', 0).number_value)
        elif intent_name == 'Default Welcome Intent':
            self.handle_welcome_intent(query_result)
        elif intent_name == 'fallback-exceed-trigger-limit':
            self.handle_fallback_exceed(query_result)
        else:
            print(f"Unhandled intent: {intent_name}")

    def handle_get_name(self, user_query):
        """Process the 'get-name' intent."""
        if any(char.isdigit() for char in user_query):
            print("There can't be a number in your name. Please repeat your name.")
        else:
            print(f"Thank you for providing your name, {user_query}.")

    def handle_get_age(self, age):
        """Process the 'get-age' intent."""
        if age <= 0:
            print("Please enter a valid age greater than zero.")
        elif age > 200:
            print("Please enter a realistic age.")
        else:
            print(f"Thank you for sharing your age: {age}!")

    def handle_welcome_intent(self, query_result):
        """Handle 'Default Welcome Intent' and ask for the user's name."""
        print(f"Handling Welcome Intent. Asking for the user's name.")
        for msg in query_result.fulfillment_messages:
            print(msg.text.text[0])
        
    def handle_fallback_exceed(self, query_result):
        """Handle 'fallback-exceed-trigger-limit' intent."""
        print(f"Handling Fallback Exceed Trigger Limit.")
        print(query_result.fulfillment_text)

