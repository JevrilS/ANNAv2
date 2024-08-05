from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django_tenants.models import TenantMixin, DomainMixin

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
    id_no = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    mobile_no = models.CharField(max_length=20)
    sex = models.CharField(max_length=10)
    strand = models.CharField(max_length=10)
    grade_level = models.CharField(max_length=2)
    school = models.ForeignKey('School', on_delete=models.SET_NULL, null=True, db_column='school_id')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now=True)  # Add this line

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['id_no', 'full_name', 'school', 'mobile_no', 'sex', 'strand', 'grade_level']
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
    """
    Model to store additional user profile information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.email


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
