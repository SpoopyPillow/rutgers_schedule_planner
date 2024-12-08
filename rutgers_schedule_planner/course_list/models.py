from django.db import models
from django.contrib import admin


class Course(models.Model):
    school_code = models.IntegerField()
    subject_code = models.IntegerField()
    course_code = models.IntegerField()
    title = models.CharField(max_length=200)

    def __str___(self):
        return self.title
