function load_section_filters(form) {
    const container = document.getElementById("section_filters");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    container.innerHTML = form;

    container.querySelectorAll("input").forEach(element => {
        element.addEventListener("click", filter_sections);
    })
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

            selected_courses.push(course);

            load_section_filters(data["section_filter_form"]);
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

            load_section_filters(data["section_filter_form"]);
            pop_selected(index);
        });
}

function toggle_course(course) {
    const index = selected_courses.findIndex(function (item, i) {
        return item.id === course.id;
    })

    const selected = document.querySelectorAll("#section_selection .selected_information")[index];
    const course_information = document.querySelectorAll("#section_selection .course_information")[index];

    if (selected.classList.contains("user_hidden")) {
        selected.classList.remove("user_hidden");
        selected.querySelector(".user_course").textContent = "v";

        course_information.style.display = "";
    }
    else {
        selected.classList.add("user_hidden");
        selected.querySelector(".user_course").textContent = "h";

        course_information.style.display = "none";
    }
}

function append_selected(course, target) {
    // COURSE SELECTION SIDEBAR
    const cselected_list = document.querySelector("#course_selection .selected_list");
    const cselected_information = template_selected_information.content.cloneNode(true);
    cselected_information.querySelector(".selected_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    cselected_information.querySelector(".user_course").textContent = "-";
    cselected_information.querySelector(".user_course").onclick = function () {
        remove_course(course, target);
    }
    cselected_list.appendChild(cselected_information);


    // SECTION SELECTION SIDEBAR
    const sselected_list = document.querySelector("#section_selection .selected_list");
    const sselected_information = template_selected_information.content.cloneNode(true);
    sselected_information.querySelector(".selected_code").textContent = course["school"]["code"] + ":" + course["subject"]["code"] + ":" + course["code"];
    sselected_information.querySelector(".user_course").textContent = "v";
    sselected_information.querySelector(".user_course").onclick = function () {
        toggle_course(course);
    }
    sselected_list.appendChild(sselected_information);


    // SECTION LIST
    const section_list = document.getElementById("section_list");
    const course_information = create_course_information(course);
    course_information.querySelector(".user_course").textContent = "v";
    course_information.querySelector(".user_course").onclick = function () {
        toggle_course(course);
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

    for (const section_information of course_information.querySelectorAll(".section_information")) {
        const td = document.createElement("td");
        const section_information_checkbox = document.createElement("input");
        section_information_checkbox.className = "select_section";
        section_information_checkbox.type = "checkbox";
        section_information_checkbox.checked = true;
        td.appendChild(section_information_checkbox);
        section_information.insertBefore(td, section_information.firstChild);
    }
    section_list.appendChild(course_information);

    initialize_collapsible();
}

function pop_selected(index) {
    // COURSE SELECTION SIDEBAR
    const cselected = document.querySelectorAll("#course_selection .selected_information")[index];
    while (cselected.firstChild) {
        cselected.removeChild(cselected.lastChild);
    }
    cselected.remove();


    // SECTION SELECTION SIDEBAR
    const sselected = document.querySelectorAll("#section_selection .selected_information")[index];
    while (sselected.firstChild) {
        sselected.removeChild(sselected.lastChild);
    }
    sselected.remove();


    // SECTION LIST
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
            for (const course of data["selected_courses"]) {
                selected_courses.push(course);
                append_selected(course, null);
            }

            load_section_filters(data["section_filter_form"]);

            document.querySelector("#course_selection .selected_list").classList.add("finished");
        });
}
