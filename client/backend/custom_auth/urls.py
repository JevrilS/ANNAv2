from django.views.generic import TemplateView
from django.urls import path
from .views import (
    register,
    FeedbackView,
    home_view,
    is_varify,
    login_view,
    UserDetailView,
    ChangePasswordView,
    SchoolListView,
    check_schema_view,
    guidance_login_view,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from custom_auth import views

urlpatterns = [
    path('', TemplateView.as_view(template_name='custom_auth/index.html'), name='home'),
    path('register/', register, name='register'),
    path('feedback/', FeedbackView.as_view(), name='feedback'),
    path('is-verify/', is_varify, name='is_verify'),
    path('login/', login_view, name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('schools/', SchoolListView.as_view(), name='school-list'),
    path('check-schema/', check_schema_view, name='check_schema'),
    path('auth/guidance-login/', guidance_login_view, name='guidance-login'),
    path('save-conversation/', views.save_conversation, name='save_conversation'),

]
