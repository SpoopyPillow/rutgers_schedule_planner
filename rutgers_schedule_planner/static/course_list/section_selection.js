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

function load_selected_course(course) {
    const container = document.getElementById("section_list");

    course_information = create_course_information(course)
    container.appendChild(course_information);

    initalize_collapsible();
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
                load_selected_course(course);
            }
        })
}

function select_course(course_data) {
    fetch("select_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(course_data),
    })
        .then(response => response.json())
        .then(data => {
            if (!("selected_course" in data)) {
                return;
            }
            course = data["selected_course"]

            const container = document.getElementById("selected_courses");
            let div = document.createElement("div");
            let code = document.createElement("span");
            div.appendChild(code);

            code.textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];

            container.appendChild(div);

            load_section_filters();
            load_selected_course(course);
        });
}

function remove_course() {
    fetch("remove_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(),
    })
        .then(response => {
            const container = document.getElementById("selected_courses");
            while (container.firstChild) {
                container.removeChild(container.lastChild);
            }

            load_section_filters();
            load_selected_course(course);
        })
}

function initialize_remove_course() {
    document.querySelectorAll(".remove_course").forEach(button => {
        button.onclick = remove_course;
    })
}

initialize_remove_course();
initialize_section_selection();