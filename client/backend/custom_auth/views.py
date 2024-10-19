from django.conf import settings
from django.db import connection
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Domain, UserProfile, User
from django.db import models  # Ensure models is imported for the objects manager
from django.http import JsonResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth import authenticate, login
import json
from .serializers import UserSerializer, ChangePasswordSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash
from .models import PublicUser, School
from rest_framework.generics import ListAPIView
from .serializers import SchoolSerializer, UserRegistrationSerializer
from rest_framework import generics
from django_tenants.utils import get_tenant_domain_model, get_public_schema_name
from .decorators import redirect_if_not_authenticated
import logging
from django_tenants.utils import schema_context
from rest_framework.permissions import AllowAny  # Import AllowAny permission class
from rest_framework_simplejwt.tokens import AccessToken
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Conversation
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.db.models.functions import ExtractYear
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator as token_generator,\
    default_token_generator
from django.urls import reverse
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMultiAlternatives  # Import EmailMultiAlternatives
@login_required
def check_terms_agreement(request):
    # Get the user's profile and check if they have agreed to terms
    profile = UserProfile.objects.get(user=request.user)
    return JsonResponse({'has_agreed_to_terms': profile.has_agreed_to_terms})

@login_required
def agree_to_terms(request):
    # Update the user's agreement status
    if request.method == 'POST':
        profile = UserProfile.objects.get(user=request.user)
        profile.has_agreed_to_terms = True
        profile.save()
        return JsonResponse({'message': 'Terms agreement updated successfully'})
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token missing'}, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken(refresh_token)
        new_access_token = refresh.access_token

        return Response({'access': str(new_access_token)}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_conversation(request):
    try:
        data = json.loads(request.body)

        # Extract conversation details from the request data
        name = data.get('name')
        age = data.get('age')
        sex = data.get('sex')
        strand = data.get('strand', '').upper()  # Convert strand to uppercase
        riasec_code = data.get('riasec_code', [])
        riasec_courses = data.get('riasec_course_recommendation', [])
        strand_courses = data.get('strand_course_recommendation', [])
        realistic_score = data.get('realistic_score', 0)
        investigative_score = data.get('investigative_score', 0)
        artistic_score = data.get('artistic_score', 0)
        social_score = data.get('social_score', 0)
        enterprising_score = data.get('enterprising_score', 0)
        conventional_score = data.get('conventional_score', 0)

        # Create a new conversation record, associate it with the authenticated user, and save to the Conversation model
        conversation = Conversation.objects.create(
            user=request.user,  # Associate with the authenticated user
            name=name,
            age=age,
            sex=sex,
            strand=strand,  # Save the uppercased strand
            riasec_code=json.dumps(riasec_code),  # Store RIASEC code as JSON
            riasec_course_recommendation=json.dumps(riasec_courses),  # Store RIASEC course recommendations as JSON
            strand_course_recommendation=json.dumps(strand_courses),  # Store strand course recommendations as JSON
            realistic_score=realistic_score,
            investigative_score=investigative_score,
            artistic_score=artistic_score,
            social_score=social_score,
            enterprising_score=enterprising_score,
            conventional_score=conventional_score
        )

        # Save the conversation
        conversation.save()

        return JsonResponse({'message': 'Conversation saved successfully!'}, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_login_status(request):
    user = request.user
    if user.is_authenticated:
        return JsonResponse({
            'is_logged_in': True,
            'user_data': {
                'name': user.full_name,
                'age': user.profile.age,
                'sex': user.sex,
                'strand': user.strand,
                # Add any other required fields
            }
        }, status=status.HTTP_200_OK)
    return JsonResponse({'is_logged_in': False}, status=status.HTTP_200_OK)

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




from django.core.mail import EmailMultiAlternatives
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import json

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
        age = data.get('age')

        # Validate input data
        if not all([id_no, full_name, email, password, confirm_password, school_id, mobile_no, sex, strand, grade_level, age]):
            return Response({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({'message': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user already exists
        if User.objects.filter(id_no=id_no).exists():
            return Response({'message': 'ID number already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the school object
        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response({'message': 'School not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create a new user but don't activate yet
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
            is_active=False  # Set user as inactive until verified
        )

        # Send verification email
        current_site = get_current_site(request)
        mail_subject = 'Activate your account.'
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verification_link = reverse('verify_email', kwargs={'uidb64': uid, 'token': token})
# Inside your register function, modify the activation URL generation
        activation_url = f"http://{current_site.domain}:{request.get_port()}{verification_link}"

        # Prepare the email content
        html_content = render_to_string('registration/activation_email.html', {
            'user': user,
            'activation_url': activation_url,
        })

        text_content = 'Please confirm your email address to complete the registration.'

        # Create email with both plain text and HTML content
        email_message = EmailMultiAlternatives(
            subject=mail_subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send()

        return Response({'message': 'Please confirm your email address to complete the registration.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'message': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_distinct_strands(request):
    """
    Retrieves distinct strands for the filter options.
    """
    try:
        strands = Conversation.objects.values_list('strand', flat=True).distinct()
        return JsonResponse(list(strands), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    try:
        # Get filters from the request
        search_query = request.GET.get('search', '')
        strand = request.GET.get('strand', '').upper()  # Convert strand to uppercase
        school_year = request.GET.get('school_year', '')

        # Check if the user is a superuser
        if request.user.is_superuser:
            # Retrieve all conversations for superuser
            conversations = Conversation.objects.all()
        else:
            # Retrieve conversations specific to the authenticated user
            conversations = Conversation.objects.filter(user=request.user)

        # Apply search filter
        if search_query:
            conversations = conversations.filter(Q(name__icontains=search_query))

        # Apply strand filter
        if strand and strand != 'Overall':
            conversations = conversations.filter(strand__iexact=strand)  # Case-insensitive exact match

        # Apply school year filter (filter by the year of the created_at field)
        if school_year and school_year != 'Overall':
            try:
                year = int(school_year.split('-')[0])
                conversations = conversations.annotate(year=ExtractYear('created_at')).filter(year=year)
            except (ValueError, ValidationError):
                return JsonResponse({'error': 'Invalid school year format.'}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare a list of conversations to return as JSON
        conversations_data = []
        for conversation in conversations:
            try:
                riasec_code = json.loads(conversation.riasec_code) if conversation.riasec_code else []
                riasec_course_recommendation = json.loads(conversation.riasec_course_recommendation) if conversation.riasec_course_recommendation else []
                strand_course_recommendation = json.loads(conversation.strand_course_recommendation) if conversation.strand_course_recommendation else []
            except json.JSONDecodeError:
                riasec_code = []
                riasec_course_recommendation = []
                strand_course_recommendation = []

            conversations_data.append({
                'user_id': conversation.user.id,  # Include the user ID in the response
                'name': conversation.name,
                'age': conversation.age,
                'sex': conversation.sex,
                'strand': conversation.strand,
                'riasec_code': riasec_code,
                'riasec_course_recommendation': riasec_course_recommendation,
                'strand_course_recommendation': strand_course_recommendation,
                'realistic_score': conversation.realistic_score,
                'investigative_score': conversation.investigative_score,
                'artistic_score': conversation.artistic_score,
                'social_score': conversation.social_score,
                'enterprising_score': conversation.enterprising_score,
                'conventional_score': conversation.conventional_score,
                'created_at': conversation.created_at
            })

        # Return the conversation data as JSON
        return JsonResponse({
            'conversations': conversations_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




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

def is_verify(request):
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

from django.conf import settings
from django.db import connection
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
import logging
from django_tenants.utils import schema_context
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            logger.warning('Email and password are required for login.')
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f'Attempting login with email: {email}')

        # Fetch the tenant schema based on the request host
        with connection.cursor() as cursor:
            cursor.execute("SELECT schema_name FROM custom_auth_domain WHERE domain = %s", [request.get_host()])
            schema_name = cursor.fetchone()

        if not schema_name:
            logger.error('No tenant schema found for the request domain')
            return Response({'message': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        with schema_context(schema_name[0]):
            # Use 'email' instead of 'username' if that's how you're authenticating users
            user = authenticate(request, username=email, password=password)

            if user is not None:
                logger.info(f'User {user.email} authenticated successfully.')
                logger.info(f'User is_active status: {user.is_active}')

                # Check if the user's account is inactive (not verified)
                if not user.is_active:
                    logger.warning(f'User {user.email} tried to log in but account is not active.')
                    return Response({
                        'message': 'Your email is not verified. Please check your inbox for a verification email and verify your account.'
                    }, status=status.HTTP_403_FORBIDDEN)

                # Proceed with login if the account is active
                refresh = RefreshToken.for_user(user)
                logger.info(f'User {user.email} successfully logged in.')
                login(request, user)  # Log the user in
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
from urllib.parse import urlparse

@api_view(['POST'])
def guidance_login_view(request):
    email = request.data.get('admin')  # Using 'admin' as the key for the email field
    password = request.data.get('password')

    # Authenticate the user using email and password
    user = authenticate(request, username=email, password=password)

    if user is not None and user.is_active:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=200)
    else:
        return Response({'error': 'Invalid credentials'}, status=400)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_data(request):
    try:
        # Get filters from the request
        search_query = request.GET.get('search', '')
        strand = request.GET.get('strand', '').upper()  # Convert to uppercase for case-insensitive comparison
        school_year = request.GET.get('school_year', '')

        # Fetch all conversations data
        conversations = Conversation.objects.all()

        # Apply search filter
        if search_query:
            conversations = conversations.filter(Q(name__icontains=search_query))

        # Apply strand filter (ensure case-insensitive matching)
        if strand and strand != 'OVERALL':
            conversations = conversations.filter(strand__iexact=strand)  # Case-insensitive exact match

        # Apply school year filter (filter by the year of the created_at field)
        if school_year and school_year != 'Overall':
            try:
                # Extract the first part of the school year, assuming it's in the format "2022-2023"
                year = int(school_year.split('-')[0])
                conversations = conversations.annotate(year=ExtractYear('created_at')).filter(year=year)
            except (ValueError, ValidationError):
                return JsonResponse({'error': 'Invalid school year format.'}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare data for each conversation
        data = []
        for conversation in conversations:
            data.append({
                'name': conversation.name,
                'sex': conversation.sex,
                'strand': conversation.strand,
                'grade_level': conversation.user.grade_level,  # Fetch grade level from related user
                'realistic_score': conversation.realistic_score,
                'investigative_score': conversation.investigative_score,
                'artistic_score': conversation.artistic_score,
                'social_score': conversation.social_score,
                'enterprising_score': conversation.enterprising_score,
                'conventional_score': conversation.conventional_score,
                'created_at': conversation.created_at,
            })

        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_conversations(request, user_id):
    try:
        # Fetch the user by ID
        user = User.objects.get(id=user_id)
        user_serializer = UserSerializer(user)
        
        # Fetch all conversations for this user
        conversations = Conversation.objects.filter(user=user)
        conversation_serializer = ConversationSerializer(conversations, many=True)
        
        # Return both user and conversation data in one response
        return Response({
            'user': user_serializer.data,
            'conversations': conversation_serializer.data
        }, status=status.HTTP_200_OK)
    
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    """
    Retrieve a user by their ID.
    """
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
def tenant_users(request):
    current_tenant = request.tenant  # Get the tenant from the request

    # Filter users by the tenant's school
    users = User.objects.filter(school__client=current_tenant)

    return render(request, 'users_list.html', {'users': users})

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)  # Get the user by ID
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    logger.info(f"UID: {uid}, Token: {token}")

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True  # Activate the user
        user.save()
        # Render the success template
        return render(request, 'registration/email_success_template.html')  # Render your HTML template for successful verification
    else:
        logger.warning("Activation link is invalid!")
        return render(request, 'registration/email_success_template.html', {'error': 'Activation link is invalid!'})