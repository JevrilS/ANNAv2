# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django_tenants.utils import get_public_schema_name, schema_context

# Public schema URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('custom_auth.urls')),  # Include custom_auth.urls for authentication
    path('api/', include('custom_auth.urls')),   # Include API routes
    path('', include('custom_auth.urls')),  # Fallback include to ensure all requests are covered
]

