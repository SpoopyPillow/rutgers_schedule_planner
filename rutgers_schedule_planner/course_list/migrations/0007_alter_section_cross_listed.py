# Generated by Django 5.1.4 on 2024-12-10 02:30

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('course_list', '0006_section_cross_listed'),
    ]

    operations = [
        migrations.AlterField(
            model_name='section',
            name='cross_listed',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.JSONField(), default=list, size=None),
        ),
    ]
