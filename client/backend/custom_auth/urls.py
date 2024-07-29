from django.urls import path
from .views import register, FeedbackView, home_view, is_varify, login_view

urlpatterns = [
    path('', home_view, name='home'),
    path('register/', register, name='register'),
    path('feedback/', FeedbackView.as_view(), name='feedback'),
    path('is-varify', is_varify, name='is_varify'),
    path('login/', login_view, name='login'),
]
