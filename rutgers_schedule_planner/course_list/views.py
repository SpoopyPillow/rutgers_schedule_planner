import requests
import json

from django.shortcuts import render, get_object_or_404
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.db import transaction

from .models import School, Subject, Course, Section, SectionClass


def index(request):
    return render(request, "course_list/index.html", {})


def update_courses(request):
    if not request.method == "POST":
        raise Http404

    params = {"year": 2025, "term": 1, "campus": "NB"}
    response = requests.post("https://classes.rutgers.edu/soc/api/courses.json", data=params)
    data = json.loads(response.text)

    with transaction.atomic():
        School.objects.all().delete()
        Subject.objects.all().delete()
        Course.objects.all().delete()

        courses = []
        sections = []
        for course_data in data:
            school_fields = {
                "code": course_data["school"]["code"],
                "title": course_data["school"]["description"],
            }
            school, _ = School.objects.get_or_create(**school_fields)

            subject_fields = {
                "code": course_data["subject"],
                "title": course_data["subjectDescription"],
            }
            subject, _ = Subject.objects.get_or_create(**subject_fields)

            course_fields = {
                "school": school,
                "subject": subject,
                "code": course_data["courseNumber"],
                "title": course_data["title"],
            }
            course = Course(**course_fields)
            courses.append(course)

            for section_data in course_data["sections"]:
                section_fields = {
                    "index": section_data["index"],
                    "number": section_data["number"],
                    "course": course,
                    "instructor": section_data["instructorsText"],
                    "open_status": section_data["openStatus"],
                }
                section = Section(**section_fields)
                sections.append(section)

        Course.objects.bulk_create(courses)
        Section.objects.bulk_create(sections)

    return HttpResponseRedirect(reverse("course_list:course_selection"))


def course_selection(request):
    courses = Course.objects.all().order_by("school", "subject", "code")
    return render(request, "course_list/course_selection.html", {"courses": courses})
