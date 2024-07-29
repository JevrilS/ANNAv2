from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('custom_auth.urls')),  # Make sure this is correct
    path('', include('custom_auth.urls')),  # Include custom_auth.urls to handle the root path
]
