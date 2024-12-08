import requests
import json

from django.shortcuts import render, get_object_or_404
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.urls import reverse

from .models import Course


def index(request):
    return render(request, "course_list/index.html", {})


def update_courses(request):
    if not request.method == "POST":
        raise Http404

    params = {"year": 2025, "term": 1, "campus": "NB"}
    response = requests.post("https://classes.rutgers.edu/soc/api/courses.json", data=params)
    data = json.loads(response.text)

    courses = []
    for course in data:
        fields = {
            "school_code": course["school"]["code"],
            "subject_code": course["subject"],
            "course_code": course["courseNumber"],
            "title": course["title"],
        }
        courses.append(Course(**fields))

    Course.objects.bulk_create(courses)
    return HttpResponseRedirect(reverse("course_list:course_selection"))


def course_selection(request):
    courses = Course.objects.all()
    return render(request, "course_list/course_selection.html", {"courses": courses})
