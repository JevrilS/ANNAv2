# custom_auth/decorators.py

from django.shortcuts import redirect
from django_tenants.utils import get_public_schema_name

def redirect_if_not_authenticated(view_func):
    def _wrapped_view(request, *args, **kwargs):
        # Check if the user is not authenticated and the current schema is not public
        if not request.user.is_authenticated and request.tenant.schema_name != get_public_schema_name():
            return redirect('/')  # Redirect to public schema's home
        return view_func(request, *args, **kwargs)
    return _wrapped_view
