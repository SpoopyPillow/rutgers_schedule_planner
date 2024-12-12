import requests
import json

from django.shortcuts import render, get_object_or_404
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.db import transaction
from django.utils.dateparse import parse_time

from .models import School, Subject, Course, Comment, Section, SectionClass


def student_related(request):
    return render(request, "course_list/student_related.html")


def course_selection(request):
    if request.method == "POST":
        raise Http404

    form = request.GET
    form_term = form.get("term")
    form_locations = form.getlist("location")
    form_levels = form.getlist("level")
    form_school = form.get("school")

    schools = School.objects.all()
    courses = Course.objects.filter(level__in=form_levels, school__code=form_school).order_by(
        "school", "subject", "code"
    )[0:5]
    return render(
        request,
        "course_list/course_selection.html",
        {
            "schools": schools,
            "courses": courses,
            "term_filter": form_term,
            "locations_filter": form_locations,
            "levels_filter": form_levels,
        },
    )


def update_db(request):
    return render(request, "course_list/update_db.html")


def update_courses(request):
    if not request.method == "POST":
        raise Http404

    params = {"year": 2025, "term": 1, "campus": "NB", "level": "U, G"}
    response = requests.post("https://classes.rutgers.edu/soc/api/courses.json", data=params)
    data = json.loads(response.text)

    with transaction.atomic():
        School.objects.all().delete()
        Subject.objects.all().delete()
        Course.objects.all().delete()
        Section.objects.all().delete()
        SectionClass.objects.all().delete()

        courses = []
        sections = []
        section_classes = []
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
                "level": course_data["level"],
                "credits": course_data["credits"],
                "core": course_data["coreCodes"],
                "prereqs": course_data["preReqNotes"],
                "synopsis_url": course_data["synopsisUrl"],
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
                    "subtitle": section_data["subtitle"],
                    "exam_code": section_data["examCode"],
                    "exam_code_text": section_data["examCodeText"],
                    "notes": section_data["sectionNotes"],
                    "restrictions": section_data["sectionEligibility"],
                    "cross_listed": [i["registrationIndex"] for i in section_data["crossListedSections"]],
                }
                section = Section(**section_fields)
                sections.append(section)

                for section_class_data in section_data["meetingTimes"]:
                    section_class_fields = {
                        "section": section,
                        "day": section_class_data["meetingDay"],
                        "start_time": parse_time(section_class_data["startTimeMilitary"]),
                        "end_time": parse_time(section_class_data["endTimeMilitary"]),
                        "campus_num": section_class_data["campusLocation"],
                        "campus_title": section_class_data["campusName"],
                        "building": section_class_data["buildingCode"],
                        "room": section_class_data["roomNumber"],
                    }
                    section_class = SectionClass(**section_class_fields)
                    section_classes.append(section_class)

        Course.objects.bulk_create(courses)
        Section.objects.bulk_create(sections)
        SectionClass.objects.bulk_create(section_classes)

        for course_data in data:
            for section_data in course_data["sections"]:
                section = Section.objects.get(index=section_data["index"])

                for comment_data in section_data["comments"]:
                    comment_fields = {
                        "code": comment_data["code"],
                        "description": comment_data["description"],
                    }
                    comment, _ = Comment.objects.get_or_create(**comment_fields)
                    section.comments.add(comment)

    return HttpResponseRedirect(reverse("course_list:student_related"))


def update_open_status(request):
    if not request.method == "POST":
        raise Http404

    return HttpResponseRedirect(reverse("course_list:student_related"))
