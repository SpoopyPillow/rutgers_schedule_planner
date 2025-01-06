function initialize_schedule_view() {
    schedule = new Array(selected_courses.length).fill(-1);

    const schedule_builder = document.getElementById("schedule_builder");
    schedule_builder.appendChild(template_schedule_view.content.cloneNode(true));

    const course_selected_list = document.getElementById("course_selected_list");
    for (var i = 0; i < selected_courses.length; i++) {
        if (hidden_courses[i]) {
            continue;
        }
        course_selected_list.appendChild(create_course_selected_information(i));
    }
}

function create_course_selected_information(course_index) {
    const course = selected_courses[course_index];

    const course_selected_information = document.createElement("div");
    course_selected_information.className = "course_selected_information";

    course_selected_information.textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];

    course_selected_information.onclick = function () {
        unfocus_schedule_sections();
        if (course_selected_information.classList.contains("focused_course")) {
            course_selected_information.classList.remove("focused_course");
            unload_section_selected_list();
            return;
        }

        focus_schedule_section(course_index);
        const focused_course = document.querySelector("#course_selected_list .focused_course")
        if (focused_course != null) {
            focused_course.classList.remove("focused_course");
        }
        course_selected_information.classList.add("focused_course");

        load_section_selected_list(course_index);
        load_schedule_section(course_index, schedule[course_index]);
    }

    return course_selected_information;
}

function load_section_selected_list(course_index) {
    const section_selected_list = document.getElementById("section_selected_list");

    while (section_selected_list.firstChild) {
        section_selected_list.removeChild(section_selected_list.lastChild);
    }

    const course = selected_courses[course_index];
    for (var i = 0; i < course["sections"].length; i++) {
        const section_index = i;
        if (selected_sections[course_index][section_index] == 0) {
            continue;
        }

        const section = course["sections"][i];

        const section_selected_information = document.createElement("div");
        section_selected_information.className = "section_selected_information";

        section_selected_information.textContent = section["number"];

        section_selected_information.onclick = function () {
            const interfering = is_valid_sections(schedule.with(course_index, section_index), course_index);
            for (const i of interfering) {
                schedule[i] = -1;
                load_schedule_section(i, -1);
            }

            schedule[course_index] = -1;
            load_schedule_section(course_index, -1);
            if (section_selected_information.classList.contains("focused_section")) {
                section_selected_information.classList.remove("focused_section");
                section_selected_information.dispatchEvent(new Event("mouseenter"));
                return;
            }

            const focused_section = document.querySelector("#section_selected_list .focused_section")
            if (focused_section != null) {
                focused_section.classList.remove("focused_section");
            }
            section_selected_information.classList.add("focused_section");

            schedule[course_index] = section_index;
            load_schedule_section(course_index, section_index);
        }

        section_selected_information.onmouseenter = function () {
            const schedule_view = document.querySelector("#schedule_builder .schedule_view");

            const interfering = is_valid_sections(schedule.with(course_index, section_index), course_index);
            for (const i of interfering) {
                schedule_view.querySelectorAll(".course_" + i).forEach(element => {
                    element.classList.add("interfering");
                });
            }

            if (section_selected_information.classList.contains("focused_section")) {
                load_schedule_section(course_index, section_index, false);
            }
            else {
                load_schedule_section(course_index, section_index, true);
            }
        }

        section_selected_information.onmouseleave = function () {
            const schedule_view = document.querySelector("#schedule_builder .schedule_view");

            schedule_view.querySelectorAll(".interfering").forEach(element => {
                element.classList.remove("interfering");
            });

            load_schedule_section(course_index, schedule[course_index], false);
        }

        section_selected_list.appendChild(section_selected_information);
    }
}

function unload_section_selected_list() {
    const section_selected_list = document.getElementById("section_selected_list");

    while (section_selected_list.firstChild) {
        section_selected_list.removeChild(section_selected_list.lastChild);
    }
}

function is_valid_sections(indices, inserted_course = null) {
    const day_intervals = {};

    for (const [course_index, section_index] of indices.entries()) {
        if (section_index == -1) {
            continue;
        }
        const course = selected_courses[course_index];
        const section = course["sections"][section_index];

        for (const section_class of section["section_classes"]) {
            if (section_class["start_time"] == null) {
                continue;
            }

            const day = section_class["day"];

            if (!(day in day_intervals)) {
                day_intervals[day] = [];
            }

            day_intervals[day].push([
                time_to_minutes(section_class["start_time"]),
                time_to_minutes(section_class["end_time"]),
                section_class["campus_title"],
                course_index
            ]);
        }
    }

    const interfering = [];
    for (const [day, intervals] of Object.entries(day_intervals)) {
        intervals.sort((a, b) => a[0] - b[0]);

        for (var i = 1; i < intervals.length; i++) {
            const cur = intervals[i];
            const prev = intervals[i - 1];
            if (cur[0] >= prev[1] + campus_travel_time(prev[2], cur[2])) {
                continue;
            }

            if (inserted_course != null) {
                interfering.push(cur[3] == inserted_course ? prev[3] : cur[3]);
            }
            else {
                return false;
            }
        }
    }

    if (inserted_course != null) {
        return interfering;
    }
    return true;
}

function campus_travel_time(campus1, campus2) {
    if (campus1 == campus2) {
        return 0;
    }
    else if (campus1 == "BUSCH" && campus2 == "LIVINGSTON"
        || campus1 == "LIVINGSTON" && campus2 == "BUSCH") {
        return 0;
    }
    else if (campus1 == "COLLEGE AVENUE" && campus2 == "DOWNTOWN"
        || campus1 == "DOWNTOWN" && campus2 == "COLLEGE AVENUE") {
        return 0;
    }
    else {
        return 40;
    }
}

function focus_schedule_section(course_index) {
    const schedule_view = document.querySelector("#schedule_builder .schedule_view");
    for (const meeting of schedule_view.querySelectorAll(".meeting")) {
        if (!(meeting.classList.contains("course_" + course_index))) {
            meeting.style.backgroundColor = shade_color(meeting.style.backgroundColor, -40);
        }
    }
}

function unfocus_schedule_sections() {
    for (var course_index = 0; course_index < selected_courses.length; course_index++) {
        load_schedule_section(course_index, schedule[course_index]);
    }
}

function load_schedule_section(course_index, section_index, hover = false) {
    const schedule_view = document.querySelector("#schedule_builder .schedule_view");

    for (const element of schedule_view.querySelectorAll((hover ? ".hover" : "") + ".course_" + course_index)) {
        while (element.firstChild) {
            element.removeChild(element.lastChild);
        }
        element.remove();
    }

    if (section_index == -1) {
        return;
    }

    if (hover) {
        for (const element of schedule_view.querySelectorAll(".course_" + course_index)) {
            element.style.opacity = 0.25;
        }
    }

    const course = selected_courses[course_index];
    const section = course["sections"][section_index];

    for (const section_class of section["section_classes"]) {
        if (section_class["start_time"] == null) {
            // TODO add to async class list
            continue;
        }

        const campus = section_class["campus_title"];
        const day = section_class["day"];
        const start_time = section_class["start_time"];
        const end_time = section_class["end_time"];
        const start_pos = time_to_percent(start_time);
        const end_pos = time_to_percent(end_time);

        const meeting = document.createElement("div");
        meeting.className = "meeting course_" + course_index;

        meeting.style.position = "absolute";
        meeting.style.top = start_pos + "%";
        meeting.style.width = "100%";
        meeting.style.height = (end_pos - start_pos) + "%";

        if (hover) {
            meeting.classList.add("hover");
            meeting.style.outline = "5px solid " + campus_colors[campus];
        }
        else {
            meeting.style.backgroundColor = campus_colors[campus];
        }

        const bar = schedule_view.querySelector("." + day + " .bar");
        bar.appendChild(meeting);
    }
}
