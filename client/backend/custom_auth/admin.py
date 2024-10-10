from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import User, UserProfile, Client, Domain, School
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Custom UserAdmin for the User model, specific to guidance users
class GuidanceUserAdmin(BaseUserAdmin):
    # Fields to display in the admin list view
    list_display = ('email', 'full_name', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'school')
    search_fields = ('email', 'full_name', 'school__school_des')

    # Fields to display when editing a user
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'mobile_no', 'sex', 'strand', 'grade_level', 'school')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    # Fields to display when adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'is_active', 'is_staff'),
        }),
    )

    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

    # Automatically set user_type to 'guidance' when saving
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # If the user is being created
            obj.user_type = 'guidance'  # Set user_type to 'guidance'
        super().save_model(request, obj, form, change)

# Register the custom UserAdmin (specific for guidance users)
admin.site.register(User, GuidanceUserAdmin)

# Admin class for UserProfile, linked to the User model
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'strand')
    search_fields = ('user__full_name', 'user__email')
    list_filter = ('strand',)

# Register UserProfile
admin.site.register(UserProfile, UserProfileAdmin)

# Admin class for School model
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('school_des', 'school_add', 'client')
    search_fields = ('school_des', 'school_add')
    list_filter = ('client',)

# Register School
admin.site.register(School, SchoolAdmin)

# Define an admin class for the Client model with TenantAdminMixin
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'schema_name', 'created_on', 'auto_create_schema')
    search_fields = ('name', 'schema_name')
    list_filter = ('created_on',)
    ordering = ('-created_on',)
    readonly_fields = ('created_on',)

# Register the Client model with the admin site
admin.site.register(Client, ClientAdmin)

# Define an admin class for the Domain model
class DomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'tenant', 'is_primary')
    search_fields = ('domain',)
    list_filter = ('tenant',)
    ordering = ('domain',)

# Register the Domain model with the admin site
admin.site.register(Domain, DomainAdmin)
