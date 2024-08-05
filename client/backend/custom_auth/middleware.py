# custom_auth/middleware/auth_middleware.py

import logging
from django.shortcuts import redirect
from django.conf import settings
from django_tenants.utils import get_public_schema_name
from django.db import connection

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
