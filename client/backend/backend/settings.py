import os
import json
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
from google.oauth2 import service_account
# Function to get allowed origins
def get_cors_allowed_origins():
    try:
        try:
            from custom_auth.models import AllowedOrigin  # Import models here to avoid AppRegistryNotReady error
        except ImportError:
            print("Error: custom_auth.models.AllowedOrigin could not be imported.")
            return []
        return [origin.origin for origin in AllowedOrigin.objects.all()]  # Return a list of allowed origins
    except Exception as e:
        print(f"Error fetching allowed origins: {e}")
        return []  # Fallback in case of error

# CORS settings
CORS_ALLOWED_ORIGINS = get_cors_allowed_origins()
# Load environment variables from .env file
load_dotenv()

# Set base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Google service account credentials
GOOGLE_PROJECT_ID = os.getenv('GOOGLE_PROJECT_ID')
GOOGLE_PRIVATE_KEY_ID = os.getenv('GOOGLE_PRIVATE_KEY_ID')
GOOGLE_PRIVATE_KEY = os.getenv('GOOGLE_PRIVATE_KEY')
if GOOGLE_PRIVATE_KEY is None:
    raise ValueError("GOOGLE_PRIVATE_KEY is not set!")
GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY.replace("\\n", "\n")
GOOGLE_CLIENT_EMAIL = os.getenv('GOOGLE_CLIENT_EMAIL')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_AUTH_URI = os.getenv('GOOGLE_AUTH_URI')
GOOGLE_TOKEN_URI = os.getenv('GOOGLE_TOKEN_URI')
GOOGLE_AUTH_PROVIDER_X509_CERT_URL = os.getenv('GOOGLE_AUTH_PROVIDER_X509_CERT_URL')
GOOGLE_CLIENT_X509_CERT_URL = os.getenv('GOOGLE_CLIENT_X509_CERT_URL')
GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
if GOOGLE_APPLICATION_CREDENTIALS:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS
    credentials = service_account.Credentials.from_service_account_file(GOOGLE_APPLICATION_CREDENTIALS)
else:
    raise ValueError("Google application credentials not found in environment variables.")
# Construct the credentials JSON
credentials_dict = {
    "type": "service_account",
    "project_id": GOOGLE_PROJECT_ID,
    "private_key_id": GOOGLE_PRIVATE_KEY_ID,
    "private_key": GOOGLE_PRIVATE_KEY,
    "client_email": GOOGLE_CLIENT_EMAIL,
    "client_id": GOOGLE_CLIENT_ID,
    "auth_uri": GOOGLE_AUTH_URI,
    "token_uri": GOOGLE_TOKEN_URI,
    "auth_provider_x509_cert_url": GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": GOOGLE_CLIENT_X509_CERT_URL,
}

# Create the credentials object
try:
    credentials = service_account.Credentials.from_service_account_info(credentials_dict)
except ValueError:
    raise ValueError("Google application credentials not found in environment variables.")

# Other environment variables
DIALOGFLOW_SESSION_ID = os.getenv('DIALOGFLOW_SESSION_ID')
DIALOGFLOW_SESSION_LANGUAGE_CODE = os.getenv('DIALOGFLOW_SESSION_LANGUAGE_CODE')
MONGO_URI = os.getenv('MONGO_URI')
JWT_SECRET = os.getenv('JWT_SECRET')
ADMIN_GOOGLE_CLIENT_EMAIL = os.getenv('ADMIN_GOOGLE_CLIENT_EMAIL')

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-0(lkz%-&m^)ow+n&vk=se9!@rg@2#&gu3pe6&40_q-j)wvbltj')
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'UIC.localhost', 'school1.localhost', 'uic.localhost', 'school1.localhost:3000', ]

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

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://school1.localhost:3000",
    "http://school1.localhost:8000",
    "http://uic.localhost:8000",
    "http://uic.localhost:3000",
    
    

    
]

CORS_ALLOW_HEADERS = ["accept", "accept-encoding", "authorization", "content-type", "dnt", "origin", "user-agent", "x-csrftoken", "x-requested-with"]
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
CORS_ALLOW_CREDENTIALS = True 

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://uic.localhost:8000",
    "http://127.0.0.1:3000",
    "http://school1.localhost:3000",
    "http://uic.localhost:3000",
]

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
    'corsheaders.middleware.CorsMiddleware', 
    'custom_auth.middleware.DynamicCorsMiddleware',  # Add this after the default CORS middleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'custom_auth.middleware.SchemaLoggerMiddleware',
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
        'NAME': 'ANNA',
        'USER': 'postgres',
        'PASSWORD': '1234',
        'HOST': 'localhost',
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
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # Add this line

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
PUBLIC_DOMAIN = 'localhost'
ADMIN_URL = 'admin/'
