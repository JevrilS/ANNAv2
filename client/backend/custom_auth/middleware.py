# custom_auth/middleware/auth_middleware.py

import logging
from django.shortcuts import redirect
from django.conf import settings
from django_tenants.utils import get_public_schema_name
from django.db import connection
from custom_auth.models import Client, AllowedOrigin  # Ensure these are properly imported
from django.http import Http404
from corsheaders.middleware import CorsMiddleware  # Import the CorsMiddleware

logger = logging.getLogger(__name__)

class SchemaLoggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log the current schema
        with connection.cursor() as cursor:
            cursor.execute("SELECT current_schema()")
            schema = cursor.fetchone()[0]
            logger.info(f'Current Schema: {schema}')

        # Attach the tenant to the request object
        domain = request.get_host().split(':')[0]  # Get the domain without port

        try:
            # Fetch the tenant based on the domain
            tenant = Client.objects.get(domains__domain=domain)
            request.tenant = tenant  # Attach tenant to request object
        except Client.DoesNotExist:
            raise Http404("Tenant not found")

        response = self.get_response(request)
        return response


class RedirectIfNotAuthenticatedMiddleware:
    """
    Middleware to redirect unauthenticated users to the public schema.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the user is authenticated and if the current schema is not public
        if not request.user.is_authenticated and request.tenant.schema_name != get_public_schema_name():
            return redirect('/')  # Redirect to public schema

        response = self.get_response(request)
        return response
class DynamicCorsMiddleware(CorsMiddleware):
    def process_response(self, request, response):
        # Fetch allowed origins from the database
        allowed_origins = [origin.origin for origin in AllowedOrigin.objects.all()]
        
        request_origin = request.META.get('HTTP_ORIGIN')
        if request_origin in allowed_origins:
            # Dynamically set Access-Control-Allow-Origin header
            response['Access-Control-Allow-Origin'] = request_origin
            response['Access-Control-Allow-Credentials'] = 'true'  # If needed

        # Ensure other CORS headers are still applied
        return super().process_response(request, response)
