function load_schedule_view() {
    const schedule_builder = document.getElementById("schedule_builder");
    schedule_builder.appendChild(template_schedule_view.content.cloneNode(true));
}

function is_valid_sections(indices) {
    const day_intervals = {};

    for (const [course_index, section_index] of indices) {
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

function load_section(course_index, section_index) {
    const schedule_view = document.querySelector("#schedule_builder .schedule_view");

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
        meeting.className = "meeting";
        meeting.draggable = true;

        meeting.style.position = "absolute";
        meeting.style.top = start_pos + "%";
        meeting.style.width = "100%";
        meeting.style.height = (end_pos - start_pos) + "%";

        meeting.style.backgroundColor = campus_colors[campus];
        meeting.style.opacity = 0.5;


        const bar = schedule_view.querySelector("." + day + " .bar");
        bar.appendChild(meeting);
    }
}

// TODO check if start_time exists
function section_product() {
    return array_product(selected_courses.map((course, index) => {
        return [...Array(course["sections"].length).keys()]
    })).map(product => product.map((value, index) => [index, value]));
}

function check_valid_sections(indices) {
    console.log(is_valid_sections(indices));

    for (const [course_index, section_index] of indices) {
        load_section(course_index, section_index);
    }
}
