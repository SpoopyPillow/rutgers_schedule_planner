function form_values(name) {
    return $("input[type=checkbox][name=" + name + "]:checked").map(function () {
        return $(this).val();
    }).toArray();
}

$(document).ready(function () {
    $("#dynamic_filters input").click(function () {
        var courses = $(".course_information")
        var sections = $(".section_information")
        courses.show();
        sections.show();

        var filters = {};
        filters.open_status = form_values("open_status");
        filters.code_level = form_values("code_level");
        filters.campus = form_values("campus");
        filters.credits = form_values("credits");
        filters.school = form_values("school");
        filters.subject = form_values("subject");
        filters.core = form_values("core")

        sections.filter(function () {
            return !filters.open_status.includes($(this).attr("data-open_status"));
        }).hide();

        courses.filter(function () {
            return !filters.code_level.includes($(this).attr("data-code_level"));
        }).hide();

        sections.filter(function () {
            var section_classes = $(this).find(".section_class_information");
            for (const section_class of section_classes) {
                if (!filters.campus.includes(section_class.getAttribute("data-campus"))) {
                    return true;
                }
            }
            return false;
        }).hide();

        courses.filter(function () {
            return !filters.credits.includes($(this).attr("data-credits"));
        }).hide();

        courses.filter(function () {
            return !filters.school.includes($(this).attr("data-school"));
        }).hide();

        courses.filter(function () {
            return !filters.subject.includes($(this).attr("data-subject"));
        }).hide();

        courses.filter(function () {
            var cores = $(this).find(".core_information");
            if (cores.length == 0 && filters.core.includes("N/A")) {
                return false;
            }
            for (const core of cores) {
                if (filters.core.includes(core.getAttribute("data-core_code"))) {
                    return false;
                }
            }
            return true;
        }).hide();
    });
});