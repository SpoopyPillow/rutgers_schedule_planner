from django.urls import path

from . import views

app_name = "course_list"
urlpatterns = [
    path("", views.index, name="index"),
    path("update_courses/", views.update_courses, name="update_courses"),
    path("course_selection/", views.course_selection, name="course_selection"),
]
