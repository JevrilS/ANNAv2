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

logger = logging.getLogger(__name__)

def is_varify(request):
    token = request.headers.get('token')
    if token_is_valid(token):
        return JsonResponse(True, safe=False)
    else:
        return JsonResponse(False, safe=False)

def token_is_valid(token):
    return token == 'valid-token'

class FeedbackView(APIView):
    def post(self, request):
        feedbackEmail = request.data.get('email')
        feedback = request.data.get('feedback')
        return Response({"message": "Feedback received successfully!", "feedback": feedback}, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
def register(request):
    try:
        data = json.loads(request.body)
        id_no = data.get('id_no')
        full_name = data.get('full_name')
        registerEmail = data.get('registerEmail')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        school = data.get('school')
        mobile_no = data.get('mobile_no')
        sex = data.get('sex')
        strand = data.get('strand')
        grade_level = data.get('grade_level')

        if not (id_no and full_name and registerEmail and password and confirm_password and school and mobile_no and sex and strand and grade_level):
            return Response({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=registerEmail).exists():
            return Response({'message': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=registerEmail, 
            password=password, 
            id_no=id_no, 
            full_name=full_name, 
            school=school, 
            mobile_no=mobile_no, 
            sex=sex, 
            strand=strand, 
            grade_level=grade_level
        )
        user.save()

        # Create the UserProfile entry
        user_profile = UserProfile.objects.create(user=user)
        user_profile.save()

        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f'Error during registration: {str(e)}')
        return Response({'message': f'An error occurred: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    try:
        data = request.data
        registerEmail = data.get('registerEmail')
        password = data.get('password')

        if not registerEmail or not password:
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f'Attempting login with email: {registerEmail}')

        user = authenticate(request, username=registerEmail, password=password)

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

def home_view(request):
    return render(request, 'custom_auth/index.html')
