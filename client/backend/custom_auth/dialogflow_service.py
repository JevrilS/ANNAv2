import os
from google.oauth2 import service_account
from google.cloud import dialogflow_v2 as dialogflow

# Get credentials from environment variables
credentials_info = {
    "type": "service_account",
    "project_id": "expanded-curve-435008-t2",
    "private_key_id": "66129cc717603aedc03f545f42084aede9424bca",
    "private_key": """-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCf3Wku9hz3lXQA
03h4dn2uYCMIu8W6nI88n0p0Lfr6BZfuHT7K41buPxxoYmmVwgXpeOthmmqm8HQW
5Ry3glgVxzW/AccCGnp8NApKv9WEJNJTX59Uwn5NxoiN22qnsYnkC95tHby8GbDb
qpRPefOfDv77/gIlJAEX58zuGS6Im8PXY4d4rf7ea9d3OuWCpeSQzzfzLdZLXItM
WVH9q83A4p4N+giHxpGK6gqj1zzic1ncoI0Lv2Wf1RT4DHwjPeJTvRGck3+6R03A
qx8tI0jBwrtucCcFGJ+vk72lU2HcZwoMIYUSw+oAZNS9s2LmNVRjg406+b41NMrB
wsRFjp2LAgMBAAECggEAQIPJ/vmzlvbpaavt4i9vaP/DI7MjiLvF0mE2WsxzjJLV
TXLf9GDqpBs0C6wrkBRM7nuuAiWfBN/k+ZhcjnI7ug460mqVNXQaGiWmQaRJNprl
hmAAnOQgtKJ6WUVDNYmgbDed+8sUb5SumvesAqbkejxDCs7nbrWo+0zAlxXygY42
3X7jaO/Jfp1SPEIhbE1t8/OMXVxCU1CUFE4ljgkXrKnG2DVCQwfDViqsLfFUAj7Y
EBcdk+U42Voa1yScJPo/RZ6KT+PNsNBAuHBFdNdS7sRyS8PZyXUa7W9vH28Mujz3
jQnlYsPNVE93JpAcs9sfiksirZ00yxPQqJrr9o12gQKBgQDe6MhU+FQWimAFz/Sn
TzbwFYmYKb4tijp2f1J/0saDD6sHU9OY2azHCQ5Jetbk7VaAC831rNm9iYxbFaNq
RVThfxXKfK/fWafWZRgcCX/4/hrX1+IaExAwBrnu0JazDDo6JSBFbmiFVcTMLN9L
FGhyRhz07mDtYng09CJcwUm9FwKBgQC3mMCqwnMgt2gc+3s7HmHYvxco/inQ3q9n
6zRpgy9Dqtp6XeKoIJuCqusQXsPs6GLAlQz/9Mi6OHtT98mtQ3FnC87s2cBW7KUu
fBZcwmko/OLiWNtuiiA+Yud4RQkSJlgA5jdt+v7HtGm30fVbxN7Qt4xB87PlB+24
X7YyYcvzrQKBgFHmN0y43LRXbQZVrK8YNLgrQZ2toJk801QcXaRnPdaDmDQeAX2E
ZK3QTvaCcpgz93ceXzLnqiywb+g7YAo4pQIg3lHCVB/84eSsyhnrB6DlQ9mQERvB
a04p+oCbFPN+B5q7b0rzUOXEaIUX64a7XdC2oAcB2oz9g+r40/M+dShLAoGAKWY+
e8LhJw10YqSqgwg01CUy2cGGOF0efHZjGS/FpqKOJW2qQHMp3esgmk5kK7WzHu39
QnI2GRfHZ4XGalV86tmUzX/EiVVPYg4FFOGZyO5NUvDqeiCXaLnwrAQVKYyP55QC
B8DDVtDtzc+AXjMkczgQXobPl+OTzTF36iB3VvkCgYB/BHEsCYYKzxI0inLrfShh
Qu26sacCYLstKYZ66+/dBYO3c7rrGTo90r5QX+K2XTWQ4tgTwZGNrZkIxZdkmQc1
d1OcJq0cY/23awUaUDOMKy8tc6BgSeDFCzOnzqd/OIILTXyAYpxZ51Cbu7bKF9eF
TMOUKBqDmdm+17a8YvPAiQ==
-----END PRIVATE KEY-----""",
    "client_email": "trytest@expanded-curve-435008-t2.iam.gserviceaccount.com",
    "client_id": "112170441478184481169",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/trytest%40expanded-curve-435008-t2.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

# Create credentials from the dictionary
credentials = service_account.Credentials.from_service_account_info(credentials_info)

class DialogflowService:
    def __init__(self, project_id, session_id, language_code, location_id="global"):
        self.project_id = project_id
        self.session_id = session_id
        self.language_code = language_code
        self.location_id = location_id
        self.session_client = dialogflow.SessionsClient(credentials=credentials)

    def detect_intent_texts(self, text, session_id):
        session = self.session_client.session_path(self.project_id, session_id)
        if self.location_id != "global":
            session = f"projects/{self.project_id}/locations/{self.location_id}/agent/sessions/{session_id}"
        text_input = dialogflow.TextInput(text=text, language_code=self.language_code)
        query_input = dialogflow.QueryInput(text=text_input)
        response = self.session_client.detect_intent(request={"session": session, "query_input": query_input})
        return response.query_result

def detect_intent_event(event, session_id, parameters, language_code, location_id="global"):
    session_client = dialogflow.SessionsClient(credentials=credentials)
    session = session_client.session_path('expanded-curve-435008-t2', session_id)
    if location_id != "global":
        session = f"projects/expanded-curve-435008-t2/locations/{location_id}/agent/sessions/{session_id}"

    event_input = dialogflow.EventInput(
        name=event,
        parameters=parameters,
        language_code=language_code
    )

    query_input = dialogflow.QueryInput(event=event_input)
    response = session_client.detect_intent(
        request={"session": session, "query_input": query_input}
    )

    return response.query_result