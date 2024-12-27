function select_course(course_data) {
    const request_data = {
        "school": course_data["school"]["code"],
        "subject": course_data["subject"]["code"],
        "code": course_data["code"],
        "supplement_code": course_data["supplement_code"],
        "campus_code": course_data["campus_code"]
    }

    fetch("select_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(request_data),
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

            update_section_selection();
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

            update_section_selection();
        })
}

function initialize_remove_course() {
    document.querySelectorAll(".remove_course").forEach(button => {
        button.onclick = remove_course;
    })
}

function update_section_filters(form) {
    const container = document.getElementById("section_filters");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    container.innerHTML = form;
}

function display_sections(courses) {
    const container = document.getElementById("section_list");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
}

function update_section_selection() {
    fetch("update_section_selection", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(),
    })
        .then(response => response.json())
        .then(data => {
            if (!("selected_courses" in data)) {
                return;
            }
            const courses = data["selected_courses"];
            const form = data["section_filter_form"];

            update_section_filters(form);
        });
}

initialize_remove_course();
update_section_selection();