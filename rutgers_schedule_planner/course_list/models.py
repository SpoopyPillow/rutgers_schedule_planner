from django.db import models
from django.contrib import admin


class School(models.Model):
    code = models.IntegerField()
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Subject(models.Model):
    code = models.IntegerField()
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Course(models.Model):
    school_code = models.ForeignKey(School, on_delete=models.CASCADE)
    subject_code = models.ForeignKey(Subject, on_delete=models.CASCADE)
    course_code = models.IntegerField()
    title = models.CharField(max_length=255)

    def __str___(self):
        return self.title


class Section(models.Model):
    index = models.IntegerField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor = models.CharField(max_length=255)
    is_open = models.BooleanField()


class SectionClass(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    time = models.TimeField()
    campus = models.CharField(max_length=255)
    building = models.CharField(max_length=255)
