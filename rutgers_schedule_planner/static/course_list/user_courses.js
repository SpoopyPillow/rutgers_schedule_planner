function select_course(course_data) {
    let container = document.getElementById("selected_courses");

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
            let div = document.createElement("div");
            let code = document.createElement("span");
            div.appendChild(code);

            code.textContent = course["school"] + ":" + course["subject"] + ":" + course["code"];

            container.appendChild(div);
        });
}

function remove_course() {
    let container = document.getElementById("selected_courses");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    fetch("remove_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify(),
    })
}

function initialize_remove_course() {
    document.querySelectorAll(".remove_course").forEach(button => {
        button.onclick = remove_course;
    })
}

initialize_remove_course();