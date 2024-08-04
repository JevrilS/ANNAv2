from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import User, UserProfile, Client, Domain, School

# Register User and UserProfile models
admin.site.register(User)
admin.site.register(UserProfile)
admin.site.register(School)
# Define an admin class for the Client model
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
