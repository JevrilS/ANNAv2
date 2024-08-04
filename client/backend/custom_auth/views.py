# custom_auth/views.py

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, User
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

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @redirect_if_not_authenticated
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)
    

    logger = logging.getLogger(__name__)



class SchoolListView(APIView):
    permission_classes = [AllowAny]  # Make this view accessible to anyone

    def get(self, request, *args, **kwargs):
        schools = School.objects.all()
        serializer = SchoolSerializer(schools, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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

        if not all([id_no, full_name, email, password, confirm_password, school_id]):
            return Response({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(id_no=id_no).exists():
            return Response({'message': 'ID number already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the school and its client schema
        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response({'message': 'School not found'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure the client exists
        client = school.client

        # Create a new user instance within the tenant schema
        with schema_context(client.schema_name):
            user = User.objects.create_user(
                id_no=id_no,
                full_name=full_name,
                email=email,
                school=school,
                password=password
            )
            user.save()

        # Attempt to find the tenant's domain associated with the client
        domain = Domain.objects.filter(tenant=client).first()
        if domain:
            redirect_url = f"http://{domain.domain}"
            return Response({'message': 'User registered successfully', 'redirect': redirect_url}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Domain for school not found'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.error(f'Error during registration: {str(e)}')
        return Response({'message': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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

@csrf_exempt
@api_view(['POST'])
@redirect_if_not_authenticated
def login_view(request):
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f'Attempting login with email: {email}')

        user = authenticate(request, username=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            logger.info('Authentication successful')
            login(request, user)  # Log the user in
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            logger.error('Authentication failed: Invalid credentials')
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f'Error during login: {str(e)}')
        return Response({'message': f'An error occurred: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@redirect_if_not_authenticated
def home_view(request):
    # Redirect based on tenant or public schema
    if request.tenant.schema_name == get_public_schema_name():
        return render(request, 'custom_auth/index.html')  # Public home
    else:
        return render(request, 'custom_auth/tenant_home.html')  # Tenant home
