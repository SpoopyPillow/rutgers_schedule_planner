function select_course(course, target) {
    fetch("select_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(course),
    })
        .then(response => response.json())
        .then(data => {
            if (!("selected_course" in data)) {
                return;
            }

            if (target != null) {
                target.textContent = "-";
                target.onclick = function () {
                    remove_course(course, target);
                }
            }

            selected_courses.push(course);

            section_filter_form = data["section_filter_form"];
            load_section_filters();
            append_selected(course, target);
        });
}

function remove_course(course, target) {
    fetch("remove_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(course),
    })
        .then(response => response.json())
        .then(data => {
            const index = data["index"];
            if (index == -1) {
                return;
            }

            if (target != null) {
                target.textContent = "+";
                target.onclick = function () {
                    select_course(course, target);
                }
            }

            selected_courses.splice(index, 1);

            section_filter_form = data["section_filter_form"];
            load_section_filters();
            pop_selected(index);
        });
}

function load_section_filters() {
    const container = document.getElementById("section_filters");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    container.innerHTML = section_filter_form;
}

function append_selected(course, target) {
    // COURSE SELECTION SIDEBAR
    const selected_list = document.getElementById("selected_list");
    const selected_information = template_selected_information.content.cloneNode(true);
    selected_information.querySelector(".selected_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    selected_information.querySelector(".user_course").textContent = "-";
    selected_information.querySelector(".user_course").onclick = function () {
        remove_course(course, target);
    }

    // SECTION LIST
    const section_list = document.getElementById("section_list");
    const course_information = create_course_information(course);
    course_information.querySelector(".user_course").textContent = "-";
    course_information.querySelector(".user_course").onclick = function () {
        remove_course(course, target);
    }
    // Create checkboxes
    const thead_tr = course_information.querySelector("thead tr");
    const th = document.createElement("th");
    const thead_tr_checkbox = document.createElement("input");
    thead_tr_checkbox.className = "select_all_sections";
    thead_tr_checkbox.type = "checkbox";
    thead_tr_checkbox.checked = true;
    th.appendChild(thead_tr_checkbox)
    thead_tr.insertBefore(th, thead_tr.firstChild);

    selected_list.appendChild(selected_information);
    section_list.appendChild(course_information);

    initialize_collapsible();
}

function pop_selected(index) {
    const selected = document.querySelectorAll(".selected_information")[index];
    while (selected.firstChild) {
        selected.removeChild(selected.lastChild);
    }
    selected.remove();

    const section = document.querySelectorAll("#section_list .course_information")[index];
    while (section.firstChild) {
        section.removeChild(section.lastChild);
    }
    section.remove();
}

function initialize_section_selection() {
    fetch("get_selected_courses", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
    })
        .then(response => response.json())
        .then(data => {
            selected_courses = data["selected_courses"];
            for (const course of selected_courses) {
                append_selected(course, null);
            }

            section_filter_form = data["section_filter_form"];
            load_section_filters();

            document.getElementById("selected_list").classList.add("finished");
        });
}
