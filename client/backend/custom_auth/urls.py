# custom_auth/urls.py

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
    df_text_query,             # Add the Dialogflow text query view
    df_event_query,            # Add the Dialogflow event query view
    dialogflow_fulfillment,
    guidance_login_view,    # Add the fulfillment webhook view
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', home_view, name='home'),
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

    # Dialogflow API endpoints
    path('api/df_text_query/', df_text_query, name='df_text_query'),
    path('api/df_event_query/', df_event_query, name='df_event_query'),
    path('api/dialogflow_fulfillment/', dialogflow_fulfillment, name='dialogflow_fulfillment'),
]
