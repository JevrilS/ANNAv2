# Generated by Django 5.0.7 on 2024-10-17 07:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('custom_auth', '0004_allowedorigin'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='strand',
            field=models.CharField(max_length=50),
        ),
    ]
