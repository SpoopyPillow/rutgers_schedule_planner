import requests
import json

from django.shortcuts import render
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.db import transaction
from django.utils.dateparse import parse_time

from .models import School, Subject, Core, Course, Comment, Section, SectionClass
from .forms import StudentRelatedForm, CourseSearchForm, CourseFilterForm


def student_related(request):
    return render(request, "course_list/student_related.html", {"form": StudentRelatedForm})


def course_selection(request):
    if not request.method == "GET":
        raise Http404
    student_form = StudentRelatedForm(request.GET)
    course_search_form = CourseSearchForm(request.GET)

    if not student_form.is_valid() or not course_search_form.is_valid():
        return HttpResponse("invalid")
    student = student_form.cleaned_data
    search = course_search_form.cleaned_data

    filters = {"level__in": student["levels"]}

    if search["school"] is not None:
        filters["school__code"] = search["school"]
    if search["subject"] is not None:
        filters["subject__code"] = search["subject"]
    if search["core"] != "":
        filters["cores__code"] = search["core"]

    courses = Course.objects.none()
    if any(search.values()):
        courses = Course.objects.filter(**filters).order_by("school", "subject", "code")

    course_filter_form = CourseFilterForm(courses=courses)

    return render(
        request,
        "course_list/course_selection.html",
        {
            "student_form": student_form,
            "course_search_form": course_search_form,
            "course_filter_form": course_filter_form,
            "courses": courses,
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
                "supplement_code": course_data["supplementCode"],
                "campus_code": course_data["campusCode"],
                "title": course_data["title"],
                "level": course_data["level"],
                "credits": course_data["credits"],
                "prereqs": course_data["preReqNotes"],
                "synopsis_url": course_data["synopsisUrl"],
            }
            if course_fields["credits"] is None:
                course_fields["credits"] = -1

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
                    if section_class_fields["campus_num"] == "O":
                        section_class_fields["campus_title"] = "ONLINE"
                    elif not section_class_fields["campus_title"]:
                        section_class_fields["campus_title"] = "N/A"

                    section_class = SectionClass(**section_class_fields)
                    section_classes.append(section_class)

        Course.objects.bulk_create(courses)
        Section.objects.bulk_create(sections)
        SectionClass.objects.bulk_create(section_classes)

        for course_data in data:
            course = Course.objects.get(
                school__code=course_data["school"]["code"],
                subject__code=course_data["subject"],
                code=course_data["courseNumber"],
                supplement_code=course_data["supplementCode"],
                campus_code=course_data["campusCode"],
            )

            for core_data in course_data["coreCodes"]:
                core_fields = {
                    "code": core_data["coreCode"],
                    "description": core_data["description"],
                }
                core, _ = Core.objects.get_or_create(**core_fields)
                course.cores.add(core)

            for section_data in course_data["sections"]:
                section = course.section_set.get(index=section_data["index"])

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
