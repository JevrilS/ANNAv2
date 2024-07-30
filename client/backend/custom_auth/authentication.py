import logging
from django.contrib.auth.backends import ModelBackend
from .models import User

logger = logging.getLogger(__name__)
class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                logger.info(f'User {email} authenticated successfully.')
                return user
            else:
                logger.warning(f'Authentication failed for user {email}: Incorrect password.')
                return None
        except User.DoesNotExist:
            logger.warning(f'Authentication failed for user {email}: User does not exist.')
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            logger.warning(f'User with ID {user_id} does not exist.')
            return None
