# Generated by Django 5.0.7 on 2024-10-15 19:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('custom_auth', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='grade_level',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
