# Generated by Django 5.1.4 on 2024-12-09 22:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('course_list', '0002_alter_section_number'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='school',
            name='unique_school_code',
        ),
        migrations.RemoveConstraint(
            model_name='section',
            name='unique_section_index',
        ),
        migrations.RemoveConstraint(
            model_name='sectionclass',
            name='unique_section_class_time',
        ),
        migrations.RemoveConstraint(
            model_name='subject',
            name='unique_subject_code',
        ),
        migrations.AddConstraint(
            model_name='school',
            constraint=models.UniqueConstraint(fields=('code',), name='unique_school'),
        ),
        migrations.AddConstraint(
            model_name='section',
            constraint=models.UniqueConstraint(fields=('index',), name='unique_section'),
        ),
        migrations.AddConstraint(
            model_name='sectionclass',
            constraint=models.UniqueConstraint(fields=('section', 'time'), name='unique_section_class'),
        ),
        migrations.AddConstraint(
            model_name='subject',
            constraint=models.UniqueConstraint(fields=('code',), name='unique_subject'),
        ),
    ]
