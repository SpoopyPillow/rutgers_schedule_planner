from django import forms
from django.contrib.postgres.forms import SimpleArrayField

from .models import School, Subject


class CourseFilterForm(forms.Form):
    term_choices = [
        ("1", "Spring"),
    ]
    term = forms.IntegerField(widget=forms.RadioSelect(choices=term_choices), required=True)

    location_choices = [
        ("nb", "New Brunswick"),
    ]
    locations = forms.MultipleChoiceField(
        widget=forms.CheckboxSelectMultiple, choices=location_choices, required=True
    )

    level_choices = [
        ("U", "Undergraduate"),
        ("G", "Graduate"),
    ]
    levels = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple, choices=level_choices, required=True)

    school_choices = [(None, "None")] + [
        (school.code, str(school.code) + " " + school.title) for school in School.objects.all().order_by("code")
    ]
    school = forms.IntegerField(widget=forms.Select(choices=school_choices), required=False)

    subject_choices = [(None, "None")] + [
        (subject.code, str(subject.code) + " " + subject.title)
        for subject in Subject.objects.all().order_by("code")
    ]
    subject = forms.IntegerField(widget=forms.Select(choices=subject_choices), required=False)
