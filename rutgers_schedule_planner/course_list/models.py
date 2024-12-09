from django.db import models
from django.contrib import admin


class School(models.Model):
    code = models.IntegerField()
    title = models.CharField(max_length=255)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["code"], name="unique_school_code")]

    def __str__(self):
        return self.title


class Subject(models.Model):
    code = models.IntegerField()
    title = models.CharField(max_length=255)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["code"], name="unique_subject_code")]

    def __str__(self):
        return self.title


class Course(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    code = models.IntegerField()
    title = models.CharField(max_length=255)

    def __str___(self):
        return self.title


class Section(models.Model):
    index = models.IntegerField()
    number = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor = models.CharField(max_length=255)
    open_status = models.BooleanField()

    class Meta:
        constraints = [models.UniqueConstraint(fields=["index"], name="unique_section_index")]


class SectionClass(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    time = models.TimeField()
    campus = models.CharField(max_length=255)
    building = models.CharField(max_length=255)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["time"], name="unique_section_class_time")]
