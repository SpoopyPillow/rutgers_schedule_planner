function form_values(name) {
    var form = document.getElementsByName(name);
    filters = []
    for (var i = 0; i < form.length; i++) {
        if (form[i].checked) {
            filters.push(form[i].getAttribute("value"));
        }
    }
    return filters;
}

function filter_sections() {
    var sections = document.getElementsByClassName("section_information");
    var filters = {};

    filters.open_status = form_values("open_status");
    filters.code_level = form_values("code_level");
    filters.campus = form_values("campus");
    filters.credits = form_values("credits")

    var courses = document.getElementsByClassName("course_information");
    for (var i = 0; i < courses.length; i++) {
        course = courses[i];
        course.classList.add("hidden")

        var code_level = course.getAttribute("data-code_level");
        if (!filters.code_level.includes(code_level)) {
            continue;
        }
        var credits = course.getAttribute("data-credits");
        if (!filters.credits.includes(credits)) {
            continue;
        }

        var sections = course.getElementsByClassName("section_information");
        for (var j = 0; j < sections.length; j++) {
            section = sections[j];
            section.classList.add("hidden");

            var open_status = section.getAttribute("data-open_status");
            if (!filters.open_status.includes(open_status)) {
                continue;
            }

            var section_classes = section.getElementsByClassName("section_class_information");
            var hide = false;
            for (var k = 0; k < section_classes.length; k++) {
                var section_class = section_classes[k];

                var campus = section_class.getAttribute("data-campus");
                if (!filters.campus.includes(campus)) {
                    hide = true;
                    break;
                }
            }
            if (hide) {
                continue;
            }

            section.classList.remove("hidden");
            course.classList.remove("hidden");
        }
    }
}

filter_sections();
