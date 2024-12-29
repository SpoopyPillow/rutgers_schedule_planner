function load_section_filters() {
    fetch("get_section_filters", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
    })
        .then(response => response.json())
        .then(data => {
            const form = data["section_filter_form"];

            const container = document.getElementById("section_filters");
            while (container.firstChild) {
                container.removeChild(container.lastChild);
            }

            container.innerHTML = form;
        })
}

function append_selected(course, target) {
    const selected_list = document.getElementById("selected_list");
    const selected_information = template_selected_information.content.cloneNode(true);
    selected_information.querySelector(".selected_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    selected_information.querySelector(".user_course").textContent = "-";
    selected_information.querySelector(".user_course").onclick = function () {
        remove_course(course, target);
    }

    const section_list = document.getElementById("section_list");
    const course_information = create_course_information(course);
    course_information.querySelector(".user_course").textContent = "-";
    course_information.querySelector(".user_course").onclick = function () {
        remove_course(course, target);
    }

    selected_list.appendChild(selected_information);
    section_list.appendChild(course_information);
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

            load_section_filters();
            pop_selected(index);
        });
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
            const courses = data["selected_courses"];
            load_section_filters();
            for (const course of courses) {
                append_selected(course, null);
            }
            document.getElementById("selected_list").classList.add("finished");
        });
}
