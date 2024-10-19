from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import  User, UserProfile, Client, Domain, School
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django_tenants.utils import get_tenant_model

# Custom filter to allow filtering by tenant name (Client)
class TenantFilter(admin.SimpleListFilter):
    title = 'Tenant'  # Displayed title in the admin filter
    parameter_name = 'tenant'  # URL parameter for filtering

    def lookups(self, request, model_admin):
        """Provide a list of tenants to filter by."""
        tenants = Client.objects.all()
        return [(tenant.id, tenant.name) for tenant in tenants]

    def queryset(self, request, queryset):
        """Filter the queryset based on the selected tenant."""
        if self.value():
            return queryset.filter(school__client_id=self.value())
        return queryset

# Custom UserAdmin for the User model, specific to guidance users
class GuidanceUserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'is_active', 'is_staff', 'school')
    list_filter = ('is_active', 'is_staff', TenantFilter)  # Add TenantFilter here
    search_fields = ('email', 'full_name', 'school__school_des')

    def get_queryset(self, request):
        """Filter users based on tenant or allow SuperAdmin to view all users."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return User.objects.all()  # Superadmin sees all users across tenants
        else:
            tenant = request.tenant  # Filter by the current tenant's schema
            return qs.filter(school__client=tenant)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'mobile_no', 'sex', 'strand', 'grade_level', 'school')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}), 
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'is_active', 'is_staff'),
        }),
    )

    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

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
