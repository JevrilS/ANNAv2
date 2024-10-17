from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.forms import JSONField
from django_tenants.models import TenantMixin, DomainMixin
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.conf import settings
from django_tenants.utils import schema_context, get_tenant_model

class Client(TenantMixin):
    """
    Tenant model which inherits from TenantMixin to implement
    a schema for each tenant.
    """
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)

    # Required: Define which tables should be shared among all tenants
    auto_create_schema = True


class Domain(DomainMixin):
    """
    Domain model which inherits from DomainMixin to specify
    the domain related to each tenant.
    """
    domain = models.CharField(max_length=100, unique=True)
    tenant = models.ForeignKey(Client, related_name='domains', on_delete=models.CASCADE)

    def __str__(self):
        return self.domain

from django_tenants.utils import schema_context, get_tenant_model

class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        school_id = extra_fields.get('school_id')
        if school_id:
            try:
                school = School.objects.get(id=school_id)
                extra_fields['school'] = school
            except School.DoesNotExist:
                raise ValueError('Invalid school id')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

    def get_users_for_tenant(self, tenant):
        """Fetch users belonging to a specific tenant"""
        with schema_context(tenant.schema_name):
            return self.get_queryset()

    def get_all_users(self):
        """Fetch users from all tenants for superadmin"""
        users = []
        tenant_model = get_tenant_model()
        tenants = tenant_model.objects.all()
        for tenant in tenants:
            with schema_context(tenant.schema_name):
                tenant_users = self.get_queryset()
                users.extend(list(tenant_users))
        return users




class Conversation(models.Model):
    # Foreign key to the user model
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conversations')

    # Other fields...
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    sex = models.CharField(max_length=20)
    strand = models.CharField(max_length=255)
    
    
    realistic_score = models.IntegerField(default=0)
    investigative_score = models.IntegerField(default=0)
    artistic_score = models.IntegerField(default=0)
    social_score = models.IntegerField(default=0)
    enterprising_score = models.IntegerField(default=0)
    conventional_score = models.IntegerField(default=0)
    riasec_code = models.JSONField()
    riasec_course_recommendation = models.JSONField()
    strand_course_recommendation = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation with {self.name} (RIASEC: {self.riasec_code})"

# Ensure this model is recognized in the 'shared' apps or 'public' schema.
class School(models.Model):
    """
    Model to represent schools accessible in the public schema.
    """
    school_des = models.CharField(max_length=255)
    school_add = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'schools'
        app_label = 'custom_auth'  # Ensure the app_label matches the installed app name
        # This makes sure the model is recognized under the app's name

    def __str__(self):
        return self.school_des

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('student', 'Student'),
    )
    
    id_no = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    mobile_no = models.CharField(max_length=20)
    sex = models.CharField(max_length=10)
    strand = models.CharField(max_length=50)
    grade_level = models.CharField(max_length=2)
    school = models.ForeignKey('School', on_delete=models.SET_NULL, null=True, db_column='school_id')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now=True)  # Add this line
    has_agreed_to_terms = models.BooleanField(default=False)

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['id_no', 'full_name', 'mobile_no', 'sex', 'strand', 'grade_level']

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='user',
    )

    def __str__(self):
        return self.email

class Feedback(models.Model):
    """
    Model to handle feedback submitted by users.
    """
    email = models.EmailField()
    feedback = models.TextField()

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    strand = models.CharField(max_length=255, null=True, blank=True)
    realistic_score = models.IntegerField(default=0)
    investigative_score = models.IntegerField(default=0)
    artistic_score = models.IntegerField(default=0)
    social_score = models.IntegerField(default=0)
    enterprising_score = models.IntegerField(default=0)
    conventional_score = models.IntegerField(default=0)
    recommended_courses = models.JSONField(null=True, blank=True)  # Use django.db.models.JSONField
    has_agreed_to_terms = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.full_name} Profile'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
# Public schema models
class PublicUser(models.Model):
    """
    Model to handle public users accessible in the public schema.
    """
    id_no = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True)
    password = models.CharField(max_length=128)

    class Meta:
        db_table = 'public_users'
        app_label = 'custom_auth'  # Ensure this matches your app name for shared models

    def __str__(self):
        return self.email
class AllowedOrigin(models.Model):
    origin = models.URLField(unique=True)

    def __str__(self):
        return self.origin