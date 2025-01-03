function load_section_filters(form) {
    const container = document.getElementById("section_filters");
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    container.innerHTML = form;

    container.querySelectorAll("input").forEach(element => {
        element.addEventListener("click", filter_sections);
    });

    filter_sections();
}

function select_course(course, target) {
    fetch("select_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
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
            hidden_courses.push(0);

            append_selected(course, target);
            load_section_filters(data["section_filter_form"]);
        });
}

function remove_course(course, target) {
    fetch("remove_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
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
            hidden_courses.splice(index, 1);

            pop_selected(index);
            load_section_filters(data["section_filter_form"]);
        });
}

function hide_course(course) {
    fetch("hide_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
    })
        .then(response => response.json())
        .then(data => {
            const index = data["index"];
            if (index == -1) {
                return;
            }
            hidden_courses[index] = 1;

            const selected = document.querySelectorAll("#section_selection .selected_information")[index];
            const course_information = document.querySelectorAll("#section_selection .course_information")[index];

            selected.classList.add("user_hidden");
            selected.querySelector(".user_course").textContent = "h";
            selected.querySelector(".user_course").onclick = function () {
                show_course(course);
            }

            course_information.style.display = "none";

            load_section_filters(data["section_filter_form"]);
        })
}

function show_course(course) {
    fetch("show_course", {
        "method": "POST",
        "headers": {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        "body": JSON.stringify({ "course": course }),
    })
        .then(response => response.json())
        .then(data => {
            const index = data["index"];
            if (index == -1) {
                return;
            }
            hidden_courses[index] = 0;

            const selected = document.querySelectorAll("#section_selection .selected_information")[index];
            const course_information = document.querySelectorAll("#section_selection .course_information")[index];

            selected.classList.remove("user_hidden");
            selected.querySelector(".user_course").textContent = "v";
            selected.querySelector(".user_course").onclick = function () {
                hide_course(course);
            }

            course_information.style.display = "";

            load_section_filters(data["section_filter_form"]);
        })
}

function append_selected(course, target, hidden = false) {
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
    if (!hidden) {
        sselected_information.querySelector(".user_course").textContent = "v";
        sselected_information.querySelector(".user_course").onclick = function () {
            hide_course(course);
        }
    }
    else {
        sselected_information.querySelector(".selected_information").classList.add("user_hidden");
        sselected_information.querySelector(".user_course").textContent = "h";
        sselected_information.querySelector(".user_course").onclick = function () {
            show_course(course);
        }
    }

    sselected_list.appendChild(sselected_information);


    // SECTION LIST
    const section_list = document.getElementById("section_list");
    const course_information = create_course_information(course);
    course_information.querySelector(".user_course").textContent = "v";
    course_information.querySelector(".user_course").onclick = function () {
        hide_course(course);
    }

    if (!hidden) {
        course_information.querySelector(".course_information").style.display = "";
    }
    else {
        course_information.querySelector(".course_information").style.display = "none";
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
            selected_courses = data["selected_courses"];
            hidden_courses = data["hidden_courses"];

            for (var i = 0; i < selected_courses.length; i++) {
                append_selected(data["selected_courses"][i], null, data["hidden_courses"][i]);
            }

            load_section_filters(data["section_filter_form"]);

            document.querySelector("#course_selection .selected_list").classList.add("finished");
        });
}
