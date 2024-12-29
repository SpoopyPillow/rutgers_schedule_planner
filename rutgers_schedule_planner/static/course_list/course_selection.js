function form_json(id) {
    const form = new FormData(document.getElementById(id));
    return Object.fromEntries(Array.from(form.keys()).map(key => [key, form.getAll(key)]));
}

function create_section_class_information(section_class) {
    const section_class_information = template_section_class_information.content.cloneNode(true);

    section_class_information.querySelector(".section_class_day").textContent = section_class["day"];
    section_class_information.querySelector(".section_class_times").textContent = section_class["start_time"] + "-" + section_class["end_time"];
    section_class_information.querySelector(".section_class_location").textContent = section_class["building"] + "-" + section_class["room"];
    section_class_information.querySelector(".section_class_campus_title").textContent = section_class["campus_title"];

    return section_class_information;
}

function create_section_information(section) {
    const section_information = template_section_information.content.cloneNode(true);

    section_information.querySelector(".section_number").textContent = section["number"];
    section_information.querySelector(".section_open_status").textContent = section["open_status"];
    section_information.querySelector(".section_index").textContent = section["index"];
    section_information.querySelector(".section_exam_code").textContent = section["exam_code"];
    section_information.querySelector(".section_instructor").textContent = section["instructor"];

    const section_class_list = section_information.querySelector(".section_class_list");
    for (const section_class of section["section_classes"]) {
        section_class_list.appendChild(create_section_class_information(section_class));
    }

    return section_information;
}

function create_course_information(course) {
    const course_information = template_course_information.content.cloneNode(true);

    course_information.querySelector(".course_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    course_information.querySelector(".course_title").textContent = course["title"];
    course_information.querySelector(".course_credits").textContent = course["credits"];

    const cores_list = course_information.querySelector(".cores_list");
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
    };

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

            for (var i = 0; i < data["courses"].length; i++) {
                const course = data["courses"][i];
                const selected = data["selected"][i]
                
                const course_information = create_course_information(course);

                const user_course = course_information.querySelector(".user_course");
                if (selected == -1)
                {
                    user_course.textContent = "+";
                    user_course.onclick = function () {
                        select_course(course, this);
                    }
                }
                else {
                    user_course.textContent = "-";
                    user_course.onclick = function () {
                        remove_course(course, this);
                    }
                    
                    const selected_button = document.querySelectorAll(".selected_information .user_course")[selected];
                    selected_button.onclick = function () {
                        remove_course(course, user_course);
                    }

                    const section_button = document.querySelectorAll("#section_list .user_course")[selected];
                    section_button.onclick = function () {
                        remove_course(course, user_course);
                    }
                }

                container.appendChild(course_information);
            }

            initialize_collapsible();
        });
}
