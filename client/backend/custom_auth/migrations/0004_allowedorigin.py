# Generated by Django 5.0.7 on 2024-10-16 22:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('custom_auth', '0003_remove_conversation_grade_level'),
    ]

    operations = [
        migrations.CreateModel(
            name='AllowedOrigin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('origin', models.URLField(unique=True)),
            ],
        ),
    ]