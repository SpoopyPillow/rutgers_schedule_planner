from django import forms

from .models import School, Subject, Course, Core


class StudentRelatedForm(forms.Form):
    term_choices = [
        ("1", "Spring"),
    ]
    term = forms.ChoiceField(widget=forms.RadioSelect, choices=term_choices)

    location_choices = [
        ("nb", "New Brunswick"),
    ]
    locations = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple, choices=location_choices)

    level_choices = [
        ("U", "Undergraduate"),
        ("G", "Graduate"),
    ]
    levels = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple, choices=level_choices)


class CourseSearchForm(forms.Form):
    school = forms.ChoiceField(required=False)
    subject = forms.ChoiceField(required=False)
    core = forms.ChoiceField(required=False)

    def __init__(self, *args, **kwargs):
        super(CourseSearchForm, self).__init__(*args, **kwargs)

        school_choices = [("", "None")] + [
            (school.code, str(school.code) + " " + school.title)
            for school in School.objects.all().order_by("code")
        ]
        self.fields["school"].choices = school_choices

        subject_choices = [("", "None")] + [
            (subject.code, str(subject.code) + " " + subject.title)
            for subject in Subject.objects.all().order_by("code")
        ]
        self.fields["subject"].choices = subject_choices

        core_choices = [("", "None")] + [
            (core.code, str(core.code) + " " + core.description) for core in Core.objects.all().order_by("code")
        ]
        self.fields["core"].choices = core_choices


class CourseFilterForm(forms.Form):
    open_status = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    code_level = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    campus = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    credits = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    school = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    subject = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    core = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)

    def __init__(self, *args, **kwargs):
        if "courses" not in kwargs:
            super(SectionFilterForm, self).__init__(*args, **kwargs)
            return

        courses = kwargs.pop("courses")
        super(SectionFilterForm, self).__init__(*args, **kwargs)

        if not all(isinstance(course, Course) for course in courses):
            courses = [Course.objects.get(id=data["id"]) for data in courses]

        choices = {field: set() for field in self.fields.keys()}

        choices["open_status"].add((True, "Open"))
        choices["open_status"].add((False, "Closed"))

        for course in courses:
            choices["code_level"].add((course.code_level(), course.code_level()))
            choices["credits"].add((course.credits, course.credits))
            choices["school"].add((course.school.code, course.school.title))
            choices["subject"].add((course.subject.code, course.subject.title))

            for core in course.cores.all():
                choices["core"].add((core.code, core.description))
            if len(course.cores.all()) == 0:
                core = Core(code="N/A", description="N/A")
                choices["core"].add((core.code, core.description))

            # TODO maybe add a method to do all of this for me
            for section in course.section_set.all():
                for section_class in section.sectionclass_set.all():
                    choices["campus"].add((section_class.campus_title, section_class.campus_title))

        for field, choices in choices.items():
            choices = list(choices)
            self.fields[field].choices = sorted(choices)
            self.fields[field].initial = [choice[0] for choice in choices]


class SectionFilterForm(forms.Form):
    open_status = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    section_type = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)
    campus_title = forms.MultipleChoiceField(widget=forms.CheckboxSelectMultiple)

    def __init__(self, *args, **kwargs):
        if "courses" not in kwargs:
            super(SectionFilterForm, self).__init__(*args, **kwargs)
            return

        courses = kwargs.pop("courses")
        super(SectionFilterForm, self).__init__(*args, **kwargs)

        if not all(isinstance(course, Course) for course in courses):
            courses = [Course.objects.get(id=data["id"]) for data in courses]

        choices = {field: set() for field in self.fields.keys()}

        open_status_choices = [(True, "Open"), (False, "Closed")]
        choices["open_status"].update(open_status_choices)

        section_type_choices = [
            ("TRADITIONAL", "Traditional/Face-to-Face"),
            ("HYBRID", "Hybrid"),
            ("ONLINE", "Online & Remote Instruction"),
        ]
        choices["section_type"].update(section_type_choices)

        for course in courses:
            # TODO maybe add a method to do all of this for me
            for section in course.section_set.all():
                for section_class in section.sectionclass_set.all():
                    choices["campus_title"].add((section_class.campus_title, section_class.campus_title))

        for field, choices in choices.items():
            choices = list(choices)
            self.fields[field].choices = sorted(choices)
            self.fields[field].initial = [choice[0] for choice in choices]
