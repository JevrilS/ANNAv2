import os
from pathlib import Path
from datetime import timedelta
from google.cloud import secretmanager
from google.oauth2 import service_account
import json

# Set base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Function to get allowed origins
def access_secret_version(project_id, secret_id):
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(name=name)
        return response.payload.data.decode('UTF-8')
    except Exception as e:
        print(f"Error accessing secret '{secret_id}': {e}")
        return None  # Return None if there's an error

# Google Cloud project and secret details
GOOGLE_PROJECT_ID = 'capstoneanna'  # Your Google Cloud project ID
SERVICE_ACCOUNT_SECRET_ID = 'service_account_info'  # Secret ID for service account
EMAIL_HOST_USER_SECRET_ID = 'EMAIL_HOST_USER'  # Secret ID for email user
EMAIL_HOST_PASSWORD_SECRET_ID = 'EMAIL_HOST_PASSWORD'  # Secret ID for email password
SECRET_KEY_SECRET_ID = 'SECRET_KEY'  # Secret ID for the Django secret key
JWT_SECRET_ID = 'JWT_SECRET'  # Secret ID for JWT secret

# Fetch secrets from Google Cloud Secret Manager
service_account_info = access_secret_version(GOOGLE_PROJECT_ID, SERVICE_ACCOUNT_SECRET_ID)
EMAIL_HOST_USER = access_secret_version(GOOGLE_PROJECT_ID, EMAIL_HOST_USER_SECRET_ID).strip()
EMAIL_HOST_PASSWORD = access_secret_version(GOOGLE_PROJECT_ID, EMAIL_HOST_PASSWORD_SECRET_ID).strip()
SECRET_KEY = access_secret_version(GOOGLE_PROJECT_ID, SECRET_KEY_SECRET_ID)
JWT_SECRET = access_secret_version(GOOGLE_PROJECT_ID, JWT_SECRET_ID)

# Load the service account key as a dictionary if it was fetched successfully
if service_account_info:
    try:
        credentials_dict = json.loads(service_account_info)
        credentials = service_account.Credentials.from_service_account_info(credentials_dict)
    except ValueError as e:
        print(f"Error creating Google credentials: {e}")
else:
    print("Service account information not fetched.")

# Check if the essential secrets are fetched successfully before using them
if EMAIL_HOST_USER is None:
    raise ValueError("EMAIL_HOST_USER not fetched from Secret Manager.")
if EMAIL_HOST_PASSWORD is None:
    raise ValueError("EMAIL_HOST_PASSWORD not fetched from Secret Manager.")
if SECRET_KEY is None:
    raise ValueError("SECRET_KEY not fetched from Secret Manager.")
if JWT_SECRET is None:
    raise ValueError("JWT_SECRET not fetched from Secret Manager.")

# Other environment variables
DIALOGFLOW_SESSION_ID = os.getenv('DIALOGFLOW_SESSION_ID')
DIALOGFLOW_SESSION_LANGUAGE_CODE = os.getenv('DIALOGFLOW_SESSION_LANGUAGE_CODE')
MONGO_URI = os.getenv('MONGO_URI')
JWT_SECRET = os.getenv('JWT_SECRET')
ADMIN_GOOGLE_CLIENT_EMAIL = os.getenv('ADMIN_GOOGLE_CLIENT_EMAIL')

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-0(lkz%-&m^)ow+n&vk=se9!@rg@2#&gu3pe6&40_q-j)wvbltj')
DEBUG = True
ALLOWED_HOSTS = ['*']

# Django REST framework settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ('rest_framework.renderers.JSONRenderer',),
    'DEFAULT_PARSER_CLASSES': ('rest_framework.parsers.JSONParser',),
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.AllowAny',),
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=10),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    'https://react-frontend-604521917673.asia-northeast1.run.app', 
    "https://annaguidance.ai",
    "https://uic.annaguidance.ai",
    "https://school1.annaguidance.ai",


]
# CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept", "accept-encoding", "authorization", 
    "content-type", "dnt", "origin", "user-agent", 
    "x-csrftoken", "x-requested-with"
]
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000", "http://localhost:8000", 
    "http://uic.localhost:8000", "http://127.0.0.1:3000", 
    "http://school1.localhost:3000", "http://uic.localhost:3000",  
    'https://react-frontend-604521917673.asia-northeast1.run.app',  # Add your frontend URL
    "https://node-backend-604521917673.asia-northeast1.run.app",
    "https://django-backend-604521917673.asia-northeast1.run.app"
    "https://annaguidance.ai",
    "https://uic.annaguidance.ai",
    "https://school1.annaguidance.ai",
]
CSRF_COOKIE_SECURE = True  # Only send CSRF cookies over HTTPS
SESSION_COOKIE_SECURE = True  # Only send session cookies over HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Applications listed in SHARED_APPS will be synced to the public schema
SHARED_APPS = (
    'django_tenants',
    'django.contrib.contenttypes',
    'django.contrib.admin',  # Admin should be here for public tenant
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'custom_auth',
    'corsheaders',
    'django_email_verification', 
    'django.contrib.sites',  # Add the email verification app
)

# TENANT_APPS
TENANT_APPS = (
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'custom_auth',
)

# Combine shared and tenant apps
INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]

# Tenant configurations
TENANT_MODEL = "custom_auth.Client"
TENANT_DOMAIN_MODEL = "custom_auth.Domain"

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}

# Middleware configuration
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',
    'custom_auth.middleware.SchemaLoggerMiddleware', 
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',

]

ROOT_URLCONF = 'backend.urls'

# Template configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'custom_auth.authentication.CustomAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Custom user model
AUTH_USER_MODEL = 'custom_auth.User'

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': 'postgres',  # Your PostgreSQL database name
        'USER': 'postgres',  # Your PostgreSQL username
        'PASSWORD': '%O,DZ/bmo1Ej^qG-',  # Your PostgreSQL password
        'HOST': '/cloudsql/capstoneanna:asia-northeast1:anna',  # Cloud SQL instance
        'PORT': '5432',
    }
}



DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
PUBLIC_DOMAIN = 'localhost'
ADMIN_URL = 'admin/'

# Email configuration for Django Email Verification
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Gmail SMTP server
EMAIL_PORT = 587  # Use TLS
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER  # Set the default from email to the user email fetched from Secret Manager

# Password reset timeout
PASSWORD_RESET_TIMEOUT = 60 * 60 * 24  # Token expires in 24 hours

# Email Verification Settings
EMAIL_MAIL_SUBJECT = 'Confirm your email {{ user.full_name }}'
EMAIL_MAIL_HTML = 'activation_email.html'
EMAIL_MAIL_PLAIN = 'activation_email.txt'  # Optionally create a plain text version
EMAIL_MAIL_TOKEN_LIFE = 60 * 60  # Token life in seconds (1 hour)
EMAIL_MAIL_PAGE_TEMPLATE = 'email_success_template.html'
CUSTOM_SALT = 'some_random_secret_salt_string'
