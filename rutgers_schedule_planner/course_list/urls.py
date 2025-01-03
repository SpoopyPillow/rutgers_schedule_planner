from django.urls import path

from . import views

app_name = "course_list"
urlpatterns = [
    path("", views.student_related, name="student_related"),
    path("course_lookup", views.course_lookup, name="course_lookup"),
    path("get_selected_courses", views.get_selected_courses, name="get_selected_courses"),
    path("load_schedule_planner_forms", views.load_schedule_planner_forms, name="load_schedule_planner_forms"),
    path("schedule_planner", views.schedule_planner, name="schedule_planner"),
    path("select_course", views.select_course, name="select_course"),
    path("remove_course", views.remove_course, name="remove_course"),
    path("show_course", views.show_course, name="show_course"),
    path("hide_course", views.hide_course, name="hide_course"),
    path("select_section", views.select_section, name="select_section"),
    path("select_all_sections", views.select_all_sections, name="select_all_sections"),
    path("deselect_section_filter", views.deselect_section_filter, name="deselect_section_filter"),
    path("select_section_filter", views.select_section_filter, name="select_section_filter"),
    path("update_db", views.update_db, name="update_db"),
    path("update_courses", views.update_courses, name="update_courses"),
    path("update_open_status", views.update_open_status, name="update_open_status"),
]
