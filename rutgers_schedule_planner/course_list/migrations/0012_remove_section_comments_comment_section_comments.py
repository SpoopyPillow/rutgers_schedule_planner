# Generated by Django 5.1.4 on 2024-12-12 01:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('course_list', '0011_course_level_course_course_list_school__138b39_idx_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='section',
            name='comments',
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=2)),
                ('description', models.CharField(max_length=255)),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('code',), name='unique_comment')],
            },
        ),
        migrations.AddField(
            model_name='section',
            name='comments',
            field=models.ManyToManyField(to='course_list.comment'),
        ),
    ]