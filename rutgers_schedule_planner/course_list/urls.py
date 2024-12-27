from django.urls import path

from . import views

app_name = "course_list"
urlpatterns = [
    path("", views.student_related, name="student_related"),
    path("course_lookup", views.course_lookup, name="course_lookup"),
    path("update_section_selection", views.update_section_selection, name="update_section_selection"),
    path("load_schedule_planner_forms", views.load_schedule_planner_forms, name="load_schedule_planner_forms"),
    path("schedule_planner", views.schedule_planner, name="schedule_planner"),
    path("select_course", views.select_course, name="select_course"),
    path("remove_course", views.remove_course, name="remove_course"),
    path("update_db", views.update_db, name="update_db"),
    path("update_courses", views.update_courses, name="update_courses"),
    path("update_open_status", views.update_open_status, name="update_open_status"),
]
