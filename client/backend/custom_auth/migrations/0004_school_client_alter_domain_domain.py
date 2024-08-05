# Generated by Django 5.0.7 on 2024-08-04 15:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('custom_auth', '0003_publicuser'),
    ]

    operations = [
        migrations.AddField(
            model_name='school',
            name='client',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='schools', to='custom_auth.client'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='domain',
            name='domain',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]