function form_json(id) {
    const form = new FormData(document.getElementById(id));
    return Object.fromEntries(Array.from(form.keys()).map(key => [key, form.getAll(key)]));
}

function create_section_class_information(section_class) {
    let section_class_information = template_section_class_information.content.cloneNode(true);

    section_class_information.querySelector(".section_class_day").textContent = section_class["day"];
    section_class_information.querySelector(".section_class_times").textContent = section_class["start_time"] + "-" + section_class["end_time"];
    section_class_information.querySelector(".section_class_location").textContent = section_class["building"] + "-" + section_class["room"];
    section_class_information.querySelector(".section_class_campus_title").textContent = section_class["campus_title"];

    return section_class_information;
}

function create_section_information(section) {
    let section_information = template_section_information.content.cloneNode(true);

    section_information.querySelector(".section_number").textContent = section["number"];
    section_information.querySelector(".section_open_status").textContent = section["open_status"];
    section_information.querySelector(".section_index").textContent = section["index"];
    section_information.querySelector(".section_exam_code").textContent = section["exam_code"];
    section_information.querySelector(".section_instructor").textContent = section["instructor"];

    let section_class_list = section_information.querySelector(".section_class_list");
    for (const section_class of section["section_classes"]) {
        section_class_list.appendChild(create_section_class_information(section_class));
    }

    return section_information;
}

function create_course_information(course) {
    let course_information = template_course_information.content.cloneNode(true);

    course_information.querySelector(".select_course").onclick = function () {
        select_course(course);
    }
    course_information.querySelector(".course_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    course_information.querySelector(".course_title").textContent = course["title"];
    course_information.querySelector(".course_credits").textContent = course["credits"];

    let cores_list = course_information.querySelector(".cores_list");
    cores_list.textContent = "Cores: ";
    for (let i = 0; i < course["cores"].length; i++) {
        let core = course["cores"][i];

        let core_information = document.createElement("span");
        core_information.className = "core_information";
        core_information.textContent = core["description"] + " (" + core["code"] + ")";
        if (i < course["cores"].length - 1) {
            core_information.textContent += ", ";
        }
        cores_list.appendChild(core_information);
    }

    let section_list = course_information.querySelector(".section_list");
    for (const section of course["sections"]) {
        section_list.appendChild(create_section_information(section));
    }

    return course_information;
}

function load_courses() {
    const form_data = {
        "course_search_form": form_json("course_search_form"),
    }

    fetch("course_lookup", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(form_data),
    })
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("course_list");
            while (container.firstChild) {
                container.removeChild(container.lastChild);
            }

            for (const course of data["courses"]) {
                container.appendChild(create_course_information(course));
            }

            initalize_collapsible();
        });
}

document.getElementById("test_display_courses").addEventListener("click", load_courses);
load_courses()
