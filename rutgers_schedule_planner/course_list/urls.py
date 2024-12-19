from django.urls import path

from . import views

app_name = "course_list"
urlpatterns = [
    path("", views.student_related, name="student_related"),
    path("load_course_selection_forms", views.load_course_selection_forms, name="load_course_selection_forms"),
    path("course_selection", views.course_selection, name="course_selection"),
    path("update_db", views.update_db, name="update_db"),
    path("update_courses", views.update_courses, name="update_courses"),
    path("update_open_status", views.update_open_status, name="update_open_status"),
]
