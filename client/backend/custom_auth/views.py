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
from .models import User, School
from rest_framework.generics import ListAPIView
from .models import School
from .serializers import SchoolSerializer, UserRegistrationSerializer
from rest_framework import generics


logger = logging.getLogger(__name__)

class SchoolListView(APIView):
    def get(self, request):
        schools = School.objects.all()
        serializer = SchoolSerializer(schools, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
@csrf_exempt
@api_view(['POST'])
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

        if not (id_no and full_name and email and password and confirm_password and school_id and mobile_no and sex and strand and grade_level):
            return Response({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'message': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response({'message': 'School not found'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            id_no=id_no,
            full_name=full_name,
            school_id=school_id,
            mobile_no=mobile_no,
            sex=sex,
            strand=strand,
            grade_level=grade_level
        )
        user.save()

        user_profile = UserProfile.objects.create(user=user)
        user_profile.save()

        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f'Error during registration: {str(e)}')
        return Response({'message': f'An error occurred: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data.copy()
        school_des = data.pop('school', {}).get('school_des')
        if school_des:
            school = get_object_or_404(School, school_des=school_des)
            data['school'] = school.id
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')
        confirm_new_password = request.data.get('confirmNewPassword')

        logger.debug(f"Current Password: {current_password}")
        logger.debug(f"New Password: {new_password}")
        logger.debug(f"Confirm New Password: {confirm_new_password}")

        if not user.check_password(current_password):
            return Response({"message": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_new_password:
            return Response({"message": "New passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)  # Keeps the user logged in after password change

        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
    
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
    def post(self, request):
        feedbackEmail = request.data.get('email')
        feedback = request.data.get('feedback')
        return Response({"message": "Feedback received successfully!", "feedback": feedback}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
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

def home_view(request):
    return render(request, 'custom_auth/index.html')
