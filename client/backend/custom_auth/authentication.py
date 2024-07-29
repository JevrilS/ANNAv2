import logging
from django.contrib.auth.backends import ModelBackend
from .models import User

logger = logging.getLogger(__name__)

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=username)
            if user.check_password(password):
                logger.info(f'User {username} authenticated successfully.')
                return user
            else:
                logger.warning(f'Authentication failed for user {username}: Incorrect password.')
                return None
        except User.DoesNotExist:
            logger.warning(f'Authentication failed for user {username}: User does not exist.')
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            logger.warning(f'User with ID {user_id} does not exist.')
            return None