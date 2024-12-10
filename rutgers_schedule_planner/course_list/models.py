from django.db import models
from django.contrib import admin
from django.contrib.postgres.fields import ArrayField


class School(models.Model):
    code = models.IntegerField()
    title = models.CharField(max_length=255)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["code"], name="unique_school")]

    def __str__(self):
        return self.title


class Subject(models.Model):
    code = models.IntegerField()
    title = models.CharField(max_length=255)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["code"], name="unique_subject")]

    def __str__(self):
        return self.title


class Course(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    code = models.IntegerField()
    title = models.CharField(max_length=255)
    credits = models.IntegerField(null=True)
    core = ArrayField(models.JSONField(), default=list)
    prereqs = models.TextField()
    synopsis_url = models.CharField(max_length=255)

    def __str___(self):
        return self.title


class Section(models.Model):
    index = models.IntegerField()
    number = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor = models.CharField(max_length=255)
    open_status = models.BooleanField()
    subtitle = models.CharField(max_length=255)
    exam_code = models.CharField(max_length=1)
    exam_code_text = models.CharField(max_length=255)
    notes = models.CharField(max_length=255)
    restrictions = models.CharField(max_length=255)
    comments = ArrayField(models.JSONField(), default=list)
    cross_listed = ArrayField(models.JSONField(), default=list)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["index"], name="unique_section")]


class SectionClass(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    day = models.CharField(max_length=1)
    start_time = models.TimeField(null=True)
    end_time = models.TimeField(null=True)
    campus_num = models.CharField(max_length=1)
    campus_title = models.CharField(max_length=255)
    building = models.CharField(max_length=255)
    room = models.CharField(max_length=255)
