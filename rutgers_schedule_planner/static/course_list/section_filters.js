function filter_sections() {
    const section_list = document.getElementById("section_list");
    const section_filters = form_json("section_filters");
    const courses = section_list.querySelectorAll(".course_information");

    for (var i = 0; i < selected_courses.length; i++) {
        const course_data = selected_courses[i];
        const course = courses[i];
        const sections = course.querySelectorAll(".section_information");

        for (var j = 0; j < course_data["sections"].length; j++) {
            const section_data = course_data["sections"][j];
            const section = sections[j];

            section.style.display = "";

            if (!("open_status" in section_filters)
                || !section_filters["open_status"].includes(section_data["open_status"] ? "True" : "False")) {
                section.style.display = "none";
            }

            if (!("section_type" in section_filters)
                || !section_filters["section_type"].includes(section_data["section_type"])) {
                section.style.display = "none";
            }

            for (const section_class_data of section_data["section_classes"]) {
                if (!("campus_title" in section_filters)
                    || !section_filters["campus_title"].includes(section_class_data["campus_title"])) {
                    section.style.display = "none";
                    break;
                }
            }
        }
    }
}
