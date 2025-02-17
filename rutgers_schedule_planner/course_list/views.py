import requests
import json

from django.shortcuts import render
from django.http import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.http.request import QueryDict
from django.urls import reverse
from django.db import transaction
from django.utils.dateparse import parse_time
from django.core import serializers

from .models import School, Subject, Core, Course, Comment, Section, SectionClass
from .forms import StudentRelatedForm, CourseSearchForm, SectionFilterForm
from .serializers import CourseSerializer
from .utils import dict_to_querydict


def student_related(request):
    return render(request, "course_list/student_related.html", {"form": StudentRelatedForm})


def course_lookup(request):
    forms = json.loads(request.body.decode("utf-8"))

    course_search_form = CourseSearchForm(dict_to_querydict(forms["course_search_form"]))

    if not course_search_form.is_valid():
        return JsonResponse({"invalid": "invalid"})
    course_search = course_search_form.cleaned_data
    student = request.session["student_related"]

    request.session["course_search"] = course_search

    filters = {"level__in": student["levels"]}

    if course_search["school"] != "":
        filters["school__code"] = course_search["school"]
    if course_search["subject"] != "":
        filters["subject__code"] = course_search["subject"]
    if course_search["core"] != "":
        filters["cores__code"] = course_search["core"]

    courses = Course.objects.none()
    if any(course_search.values()):
        courses = Course.objects.filter(**filters).order_by("school", "subject", "code")

    serializer = CourseSerializer(courses, many=True)

    if "selected_courses" not in request.session:
        request.session["selected_courses"] = []

    selected = []
    for course_json in serializer.data:
        if course_json in request.session["selected_courses"]:
            selected.append(request.session["selected_courses"].index(course_json))
        else:
            selected.append(-1)

    return JsonResponse({"courses": serializer.data, "selected": selected})


def load_schedule_planner_forms(request):
    student_form = StudentRelatedForm(request.POST)
    course_search_form = CourseSearchForm(request.POST)

    if not student_form.is_valid() or not course_search_form.is_valid():
        return HttpResponse("invalid")
    student = student_form.cleaned_data
    course_search = course_search_form.cleaned_data

    request.session["student_related"] = student
    request.session["course_search"] = course_search
    return HttpResponseRedirect(reverse("course_list:schedule_planner"))


def schedule_planner(request):
    if not request.method == "GET":
        raise Http404

    search = request.session["course_search"]
    course_search_form = CourseSearchForm(initial=search)

    return render(
        request,
        "course_list/schedule_planner.html",
        {
            "course_search_form": course_search_form,
        },
    )


def select_course(request):
    data = json.loads(request.body.decode("utf-8"))
    course_data = data["course"]

    if "selected_courses" not in request.session:
        request.session["selected_courses"] = []
        request.session["selected_sections"] = []
        request.session["hidden_courses"] = []

    # TODO replace id with course specific identifiers
    course = Course.objects.get(id=course_data["id"])

    serialized_course = CourseSerializer(course)
    if serialized_course.data in request.session["selected_courses"]:
        return JsonResponse({})
    request.session["selected_courses"] += [serialized_course.data]
    request.session["selected_sections"] += [[1] * len(serialized_course.data["sections"])]
    request.session["hidden_courses"] += [0]

    form = SectionFilterForm(
        courses=request.session["selected_courses"],
        hidden_courses=request.session["hidden_courses"],
    )

    return JsonResponse({"selected_course": serialized_course.data, "section_filter_form": form.as_p()})


def remove_course(request):
    data = json.loads(request.body.decode("utf-8"))
    course_data = data["course"]

    if "selected_courses" not in request.session:
        request.session["selected_courses"] = []
        request.session["selected_sections"] = []
        request.session["hidden_courses"] = []

    if course_data not in request.session["selected_courses"]:
        return JsonResponse({"index": -1})

    index = request.session["selected_courses"].index(course_data)
    request.session["selected_courses"].pop(index)
    request.session["selected_sections"].pop(index)
    request.session["hidden_courses"].pop(index)

    request.session.modified = True

    form = SectionFilterForm(
        courses=request.session["selected_courses"],
        hidden_courses=request.session["hidden_courses"],
    )

    return JsonResponse({"index": index, "section_filter_form": form.as_p()})


def hide_course(request):
    data = json.loads(request.body.decode("utf-8"))
    course_data = data["course"]

    if "selected_courses" not in request.session:
        request.session["selected_courses"] = []
        request.session["hidden_courses"] = []

    if course_data not in request.session["selected_courses"]:
        return JsonResponse({"index": -1})

    index = request.session["selected_courses"].index(course_data)
    request.session["hidden_courses"][index] = 1
    request.session.modified = True

    form = SectionFilterForm(
        courses=request.session["selected_courses"], hidden_courses=request.session["hidden_courses"]
    )

    return JsonResponse({"index": index, "section_filter_form": form.as_p()})


def show_course(request):
    data = json.loads(request.body.decode("utf-8"))
    course_data = data["course"]

    if "selected_courses" not in request.session:
        request.session["selected_courses"] = []
        request.session["hidden_courses"] = []

    if course_data not in request.session["selected_courses"]:
        return JsonResponse({"index": -1})

    index = request.session["selected_courses"].index(course_data)
    request.session["hidden_courses"][index] = 0
    request.session.modified = True

    form = SectionFilterForm(
        courses=request.session["selected_courses"], hidden_courses=request.session["hidden_courses"]
    )

    return JsonResponse({"index": index, "section_filter_form": form.as_p()})


def select_section(request):
    data = json.loads(request.body.decode("utf-8"))
    ci = data["course_index"]
    si = data["section_index"]

    request.session["selected_sections"][ci][si] = 1 if request.session["selected_sections"][ci][si] == 0 else 0
    request.session.modified = True

    return JsonResponse({"selected": request.session["selected_sections"][ci][si]})


def select_all_sections(request):
    data = json.loads(request.body.decode("utf-8"))
    ci = data["course_index"]
    checked = data["checked"]

    request.session["selected_sections"][ci] = [1 if checked else 0] * len(
        request.session["selected_sections"][ci]
    )
    request.session.modified = True
    
    return JsonResponse({})


def deselect_section_filter(request):
    data = json.loads(request.body.decode("utf-8"))
    name = data["name"]
    value = data["value"]

    if "deselected_section_filters" not in request.session:
        request.session["deselected_section_filters"] = {}

    if name not in request.session["deselected_section_filters"]:
        request.session["deselected_section_filters"][name] = []
    if value not in request.session["deselected_section_filters"][name]:
        request.session["deselected_section_filters"][name] += [value]
    request.session.modified = True

    return JsonResponse({"deselected_section_filters": request.session["deselected_section_filters"]})


def select_section_filter(request):
    data = json.loads(request.body.decode("utf-8"))
    name = data["name"]
    value = data["value"]

    if "deselected_section_filters" not in request.session:
        request.session["deselected_section_filters"] = {}

    if name not in request.session["deselected_section_filters"]:
        request.session["deselected_section_filters"][name] = []
    if value in request.session["deselected_section_filters"][name]:
        request.session["deselected_section_filters"][name].remove(value)
        request.session.modified = True

    return JsonResponse({"deselected_section_filters": request.session["deselected_section_filters"]})


def get_selected_courses(request):
    if "selected_courses" not in request.session:
        request.session["selected_courses"] = []
        request.session["selected_sections"] = []
        request.session["hidden_courses"] = []
    if "deselected_section_filters" not in request.session:
        request.session["deselected_section_filters"] = {}

    form = SectionFilterForm(
        courses=request.session["selected_courses"], hidden_courses=request.session["hidden_courses"]
    )

    return JsonResponse(
        {
            "selected_courses": request.session["selected_courses"],
            "selected_sections": request.session["selected_sections"],
            "hidden_courses": request.session["hidden_courses"],
            "deselected_section_filters": request.session["deselected_section_filters"],
            "section_filter_form": form.as_p(),
        }
    )


########################################## UPDATING #####################################################


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
                    "exam_code": section_data["examCode"],
                    "exam_code_text": section_data["examCodeText"],
                    "subtitle": section_data["subtitle"],
                    "subtopic": section_data["subtopic"],
                    "notes": section_data["sectionNotes"],
                    "eligibility": section_data["sectionEligibility"],
                    "majors": section_data["majors"],
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
