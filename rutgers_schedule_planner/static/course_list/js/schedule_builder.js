function initialize_schedule_view() {
    schedule = new Array(selected_courses.length).fill(-1);

    const schedule_builder = document.getElementById("schedule_builder");
    schedule_builder.appendChild(template_schedule_view.content.cloneNode(true));

    const course_selected_list = document.getElementById("course_selected_list");
    for (var i = 0; i < selected_courses.length; i++) {
        course_selected_list.appendChild(create_course_selected_information(i));
    }
}

function create_course_selected_information(course_index) {
    const course = selected_courses[course_index];

    const course_selected_information = document.createElement("div");
    course_selected_information.className = "course_selected_information";

    course_selected_information.textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];

    course_selected_information.onclick = function () {
        load_section_selected_list(course_index);
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
        const section = course["sections"][i];

        const section_selected_information = document.createElement("div");
        section_selected_information.className = section_selected_information;

        section_selected_information.textContent = section["number"];

        section_selected_information.onclick = function () {
            if (!is_valid_sections(schedule.with(course_index, section_index))) {
                console.log("invalid");
                return;
            }
            schedule[course_index] = section_index;
            load_section(course_index, section_index);
        }
        section_selected_information.onmouseenter = function () {
            console.log("mouse on");
            load_section(course_index, section_index, true);
        }
        section_selected_information.onmouseleave = function () {
            console.log("mouse off");
            load_section(course_index, schedule[course_index], false);
        }

        section_selected_list.appendChild(section_selected_information);
    }
}

function is_valid_sections(indices) {
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
                section_class["campus_title"]
            ]);
        }
    }

    for (const [day, intervals] of Object.entries(day_intervals)) {
        intervals.sort((a, b) => a[0] - b[0]);

        let prev_end = intervals[0][1];
        let prev_campus = intervals[0][2];
        for (const [start, end, campus] of intervals.slice(1)) {
            if (start >= prev_end + campus_travel_time(prev_campus, campus)) {
                prev_end = end;
                prev_campus = campus;
            }
            else {
                return false;
            }
        }
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

function load_section(course_index, section_index, hover = false) {
    const schedule_view = document.querySelector("#schedule_builder .schedule_view");

    schedule_view.querySelectorAll((hover ? ".hover" : "") + ".course_" + course_index)
        .forEach(element => {
            while (element.firstChild) {
                element.removeChild(element.lastChild);
            }
            element.remove();
        });

    if (hover) {
        schedule_view.querySelectorAll(".course_" + course_index)
            .forEach(element => {
                element.style.opacity = 0.25;
            })
    }

    if (section_index == -1) {
        return;
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

        meeting.style.backgroundColor = campus_colors[campus];

        if (hover) {
            meeting.classList.add("hover");
        }


        const bar = schedule_view.querySelector("." + day + " .bar");
        bar.appendChild(meeting);
    }
}
