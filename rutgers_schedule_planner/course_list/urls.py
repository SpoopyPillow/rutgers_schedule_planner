from django.urls import path

from . import views

app_name = "course_list"
urlpatterns = [
    path("", views.index, name="index"),
    path("update_db", views.update_db, name="update_db"),
    path("update_courses/", views.update_courses, name="update_courses"),
    path("update_open_status/", views.update_open_status, name="update_open_status"),
    path("course_selection/", views.course_selection, name="course_selection"),
]
