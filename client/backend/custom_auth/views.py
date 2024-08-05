# custom_auth/views.py
from django.conf import settings
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Domain, UserProfile, User
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
import logging
import json
from .serializers import UserSerializer, ChangePasswordSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash
from .models import PublicUser, School
from rest_framework.generics import ListAPIView
from .models import School
from .serializers import SchoolSerializer, UserRegistrationSerializer
from rest_framework import generics
from django_tenants.utils import get_tenant_domain_model, get_public_schema_name
from .decorators import redirect_if_not_authenticated
import logging
from django_tenants.utils import schema_context
from rest_framework.permissions import AllowAny  # Import AllowAny permission class
logger = logging.getLogger(__name__)
from rest_framework.permissions import IsAuthenticated, AllowAny  # Ensure these imports are present
from rest_framework.decorators import api_view, permission_classes  # Import permission_classes
from django.db import connection
from .dialogflow_service import DialogflowService
from rest_framework_simplejwt.tokens import AccessToken

# Initialize Dialogflow Service
dialogflow_service = DialogflowService(
    project_id=settings.GOOGLE_PROJECT_ID,
    session_id=settings.DIALOGFLOW_SESSION_ID,
    language_code=settings.DIALOGFLOW_SESSION_LANGUAGE_CODE
)

@csrf_exempt
def df_text_query(request):
    """
    Handles Dialogflow text queries from the client application.
    """
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            text = body.get('text')
            user_id = body.get('userId')  # Use this if you have multiple session IDs
            parameters = body.get('parameters', {})

            # Log the incoming request
            logger.debug(f"Received text query: {text} for user: {user_id}")

            response = dialogflow_service.detect_intent_texts(text, user_id)
            
            # Log the Dialogflow response
            logger.debug(f"Dialogflow response: {response}")

            return JsonResponse({
                'fulfillmentText': response.fulfillment_text,
                'intent': response.intent.display_name,
                'parameters': response.parameters
            }, status=200)
        except Exception as e:
            logger.error(f"Error processing text query: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def df_event_query(request):
    """
    Handles Dialogflow event queries from the client application.
    """
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            event = body.get('event')
            user_id = body.get('userId')
            parameters = body.get('parameters', {})

            # Log the incoming request
            logger.debug(f"Received event query: {event} for user: {user_id}")

            response = dialogflow_service.detect_intent_event(event, user_id, parameters)
            
            # Log the Dialogflow response
            logger.debug(f"Dialogflow response: {response}")

            return JsonResponse({
                'fulfillmentText': response.fulfillment_text,
                'intent': response.intent.display_name,
                'parameters': response.parameters
            }, status=200)
        except Exception as e:
            logger.error(f"Error processing event query: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def dialogflow_fulfillment(request):
    """
    Handles Dialogflow fulfillment webhook calls.
    """
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            agent = WebhookClient(body)

            # Log the incoming fulfillment request
            logger.debug(f"Fulfillment request: {body}")

            # Define intent handlers
            def handle_get_name(agent):
                user_query = agent.query
                if any(char.isdigit() for char in user_query):
                    agent.add('There can\'t be a number in your name. Please repeat your name for me. Thank you 😊.')
                    agent.set_followup_event('GET_NAME_WITH_NUMBER_FALLBACK')
                else:
                    quick_replies = Payload(
                        agent.UNSPECIFIED,
                        {'quick_replies': [{'text': 'Yes'}, {'text': 'No'}]},
                        {'rawPayload': True, 'sendAsMessage': True}
                    )
                    agent.add(quick_replies)

            def handle_get_age(agent):
                age = agent.parameters.get('age', 0)
                if age <= 0:
                    agent.add('Please enter a valid age greater than zero.')
                    agent.set_followup_event('GET_AGE_LOW_FALLBACK')
                elif age > 200:
                    agent.add('Please enter a realistic age.')
                    agent.set_followup_event('GET_AGE_HIGH_FALLBACK')
                else:
                    agent.add(f"Thank you for sharing your age: {age}!")

            # Add more intent handler functions...

            # Map intents to handler functions
            intent_map = {
                'get-name': handle_get_name,
                'get-age': handle_get_age,
                # Add more intents and handlers as needed
            }

            # Process the intent
            agent.handle_request(intent_map)

            return JsonResponse({'status': 'success'}, status=200)

        except Exception as e:
            logger.error(f"Error processing fulfillment request: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user  # Retrieve the authenticated user
            logger.debug(f'Fetching user details for {user.email}')
            serializer = UserSerializer(user)  # Serialize the user object
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f'Error fetching user details: {str(e)}')
            return Response({'error': 'User not found or unauthorized access'}, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)  # partial=True allows for partial updates
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    logger = logging.getLogger(__name__)



class SchoolListView(APIView):
    permission_classes = [AllowAny]  # Make this view accessible to anyone

    def get(self, request, *args, **kwargs):
        schools = School.objects.all()
        serializer = SchoolSerializer(schools, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        data = json.loads(request.body)
        id_no = data.get('id_no')
        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        school_id = data.get('school_id')
        mobile_no = data.get('mobile_no')
        sex = data.get('sex')
        strand = data.get('strand')
        grade_level = data.get('grade_level')

        # Validate input data
        if not all([id_no, full_name, email, password, confirm_password, school_id, mobile_no, sex, strand, grade_level]):
            return JsonResponse({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return JsonResponse({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user already exists
        if User.objects.filter(id_no=id_no).exists():
            return JsonResponse({'message': 'ID number already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the school object directly
        try:
            school = School.objects.get(id=school_id)
            logger.debug(f"Found school: {school}")
        except School.DoesNotExist:
            logger.error(f'School with id {school_id} not found')
            return JsonResponse({'message': 'School not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create a new user within the current schema
        user = User.objects.create_user(
            id_no=id_no,
            full_name=full_name,
            email=email,
            school=school,
            password=password,
            mobile_no=mobile_no,
            sex=sex,
            strand=strand,
            grade_level=grade_level,
        )
        user.save()
        logger.info(f"User {user.email} created successfully")

        return JsonResponse({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f'Error during registration: {str(e)}')
        return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @redirect_if_not_authenticated
    def put(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            current_password = serializer.validated_data['current_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(current_password):
                return Response({'message': 'Incorrect current password'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            update_session_auth_hash(request, user)  # Update session to prevent logout
            return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    class UpdateUserView(generics.UpdateAPIView):
        serializer_class = UserSerializer
        queryset = User.objects.all()

def is_varify(request):
    token = request.headers.get('token')
    if token_is_valid(token):
        return JsonResponse(True, safe=False)
    else:
        return JsonResponse(False, safe=False)

def token_is_valid(token):
    return token == 'valid-token'

class FeedbackView(APIView):

    @redirect_if_not_authenticated
    def post(self, request):
        feedbackEmail = request.data.get('email')
        feedback = request.data.get('feedback')
        return Response({"message": "Feedback received successfully!", "feedback": feedback}, status=status.HTTP_200_OK)

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login
from django_tenants.utils import schema_context, get_tenant_domain_model
from django.db import connection
from .models import Domain, User, School
import logging
import json

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f'Attempting login with email: {email}')

        # Assuming you use the request host to determine the schema
        with connection.cursor() as cursor:
            cursor.execute("SELECT schema_name FROM custom_auth_client WHERE domain = %s", [request.get_host()])
            schema_name = cursor.fetchone()

        if not schema_name:
            logger.error('No tenant schema found for the request domain')
            return Response({'message': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        with schema_context(schema_name[0]):
            user = authenticate(request, username=email, password=password)

            if user is not None and user.is_active:
                refresh = RefreshToken.for_user(user)
                logger.info('Authentication successful')
                login(request, user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            else:
                logger.error('Authentication failed: Invalid credentials or inactive account')
                return Response({'message': 'Invalid credentials or inactive account'}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        logger.error(f'Error during login: {str(e)}')
        return Response({'message': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@redirect_if_not_authenticated
def home_view(request):
    # Redirect based on tenant or public schema
    if request.tenant.schema_name == get_public_schema_name():
        return render(request, 'custom_auth/index.html')  # Public home
    else:
        return render(request, 'custom_auth/tenant_home.html')  # Tenant home
def check_schema_view(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT current_schema()")
        schema = cursor.fetchone()[0]
    return JsonResponse({'current_schema': schema})