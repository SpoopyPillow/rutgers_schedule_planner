from django import forms

from .models import School, Subject, Core


class StudentFilterForm(forms.Form):
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


class CourseFilterForm(forms.Form):
    school_choices = [(None, "None")] + [
        (school.code, str(school.code) + " " + school.title) for school in School.objects.all().order_by("code")
    ]
    school = forms.IntegerField(widget=forms.Select(choices=school_choices), required=False)

    subject_choices = [(None, "None")] + [
        (subject.code, str(subject.code) + " " + subject.title)
        for subject in Subject.objects.all().order_by("code")
    ]
    subject = forms.IntegerField(widget=forms.Select(choices=subject_choices), required=False)

    core_choices = [(None, "None")] + [
        (core.code, str(core.code) + " " + core.description) for core in Core.objects.all().order_by("code")
    ]
    core = forms.CharField(widget=forms.Select(choices=core_choices), max_length=255, required=False)
