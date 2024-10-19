from django.views.generic import TemplateView
from django.urls import path
from .views import (
    register,
    FeedbackView,
    home_view,
    is_verify,
    login_view,
    UserDetailView,
    ChangePasswordView,
    SchoolListView,
    check_schema_view,
    guidance_login_view,
    get_conversations,        # Import the get_conversations view
    get_distinct_strands, 
    check_login_status,
    check_terms_agreement,
    agree_to_terms,
    get_dashboard_data, 
    verify_email,# Import the get_distinct_strands view
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from custom_auth import views

urlpatterns = [
    path('', TemplateView.as_view(template_name='custom_auth/index.html'), name='home'),
    path('register/', register, name='register'),
    path('feedback/', FeedbackView.as_view(), name='feedback'),
    path('is-verify/', is_verify, name='is_verify'),
    path('login/', login_view, name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('schools/', SchoolListView.as_view(), name='school-list'),
    path('check-schema/', check_schema_view, name='check_schema'),
    path('auth/guidance-login/', guidance_login_view, name='guidance-login'),
    path('save-conversation/', views.save_conversation, name='save_conversation'),
    path('get-conversations/', get_conversations, name='get-conversations'),  # New URL for fetching conversations
    path('courses-distinct-strand/', get_distinct_strands, name='courses-distinct-strand'),  # New URL for fetching distinct strands
    path('check_login_status/', check_login_status, name='check_login_status'),  # Add check_login_status URL
    path('api/check_terms_agreement/', check_terms_agreement, name='check_terms_agreement'),
    path('api/agree_to_terms/', agree_to_terms, name='agree_to_terms'),
    path('api/dashboard/', get_dashboard_data, name='get_dashboard_data'),
    path('get-user/<int:user_id>/', views.get_user_by_id, name='get-user-by-id'),
    path('verify-email/<uidb64>/<token>/', verify_email, name='verify_email'),


]
