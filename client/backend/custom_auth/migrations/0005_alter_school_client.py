# Generated by Django 5.0.7 on 2024-08-04 15:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('custom_auth', '0004_school_client_alter_domain_domain'),
    ]

    operations = [
        migrations.AlterField(
            model_name='school',
            name='client',
            field=models.ForeignKey(db_column='client_id', on_delete=django.db.models.deletion.CASCADE, related_name='schools', to='custom_auth.client'),
        ),
    ]
